document.addEventListener('DOMContentLoaded', function() {
  // تنظیمات EmailJS
  (function() {
    emailjs.init({
      publicKey: "7zOCMQKI0bRjmv6cn", // کلید عمومی صحیح است
    });
  })();

  // متغیرهای سراسری
  let uniqueId = generateUniqueId();

  // نمایش و مخفی کردن بخش‌های مختلف فرم بر اساس نوع ملک
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  const detailSections = {
    'آپارتمان': document.getElementById('apartmentDetails'),
    'ویلا': document.getElementById('villaDetails'),
    'زمین': document.getElementById('landDetails'),
    'تجاری / مغازه': document.getElementById('commercialDetails'),
    'کلنگی': document.getElementById('oldDetails'),
    'پیش‌فروش': document.getElementById('presaleTypeSection')
  };
  const presaleDetailSections = {
    'آپارتمان': document.getElementById('presaleApartmentDetails'),
    'ویلا': document.getElementById('presaleVillaDetails')
  };

  // ******** تابع جدید برای تنظیم تاریخ شمسی ********
  function setJalaliDate() {
    try {
        const today = new Date();
        // استفاده از منطقه زمانی تهران برای دقت بیشتر
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            calendar: 'persian',
            timeZone: 'Asia/Tehran' // مهم برای دقت تاریخ در ایران
        };
        // فرمت تاریخ به صورت شمسی (مثلا ۱۴۰۴/۰۱/۰۸)
        const persianDate = new Intl.DateTimeFormat('fa-IR', options).format(today);

        // پیدا کردن فیلد تاریخ و تنظیم مقدار آن
        const dateInput = document.getElementById('registrationDate');
        if (dateInput) {
            dateInput.value = persianDate;
        }
    } catch (error) {
        console.error("Error setting Jalali date:", error);
        // در صورت بروز خطا، یک پیام جایگزین در placeholder نمایش داده می‌شود
        const dateInput = document.getElementById('registrationDate');
        if (dateInput) {
            dateInput.placeholder = "خطا در دریافت تاریخ";
        }
    }
  }

  // ******** فراخوانی تابع تنظیم تاریخ شمسی در ابتدا ********
  setJalaliDate();

  // تنظیم رویدادها
  setupEventListeners();
  setupNumericInputs(); // اضافه کردن تابع جدید برای تنظیم فیلدهای عددی

  // تنظیم فیلدهای عددی برای کیبورد مخصوص اعداد
  function setupNumericInputs() {
    // اضافه کردن ویژگی inputmode="numeric" به فیلدهای عددی
    document.querySelectorAll('.numeric-only, .price-input').forEach(input => {
      input.setAttribute('inputmode', 'numeric');
    });
  }

  // تنظیم رویدادهای فرم
  function setupEventListeners() {
    // انتخاب نوع ملک
    propertyTypeRadios.forEach(radio => {
      radio.addEventListener('change', handlePropertyTypeChange);
    });

    // انتخاب نوع پیش‌فروش
    presaleTypeRadios.forEach(radio => {
      radio.addEventListener('change', handlePresaleTypeChange);
    });

    // فقط اعداد در فیلدهای عددی
    document.querySelectorAll('.numeric-only').forEach(input => {
      input.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    });

    // فقط حروف فارسی در فیلدهای متنی فارسی
    document.querySelectorAll('.persian-letters-only').forEach(input => {
      input.addEventListener('input', function() {
        this.value = this.value.replace(/[^آ-یءچحجژ\s]/g, '');
      });
    });

    // حروف فارسی و اعداد در فیلدهای ترکیبی
    document.querySelectorAll('.persian-and-numbers-only').forEach(input => {
      input.addEventListener('input', function() {
        // اجازه به نقطه، کاما، پرانتز و خط تیره
        this.value = this.value.replace(/[^آ-یءچحجژ0-9\s.,()\-]/g, '');
      });
    });

    // فرمت قیمت با جدا کننده هزارگان - اصلاح شده برای اعداد چند رقمی
    document.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('input', function(e) {
        // حذف همه کاراکترهای غیر عددی
        let value = this.value.replace(/[^\d]/g, '');

        // اگر مقدار خالی نیست، آن را فرمت کنیم
        if (value) {
          // فرمت با جداکننده هزارگان بدون تبدیل به عدد (برای پشتیبانی از اعداد بزرگ)
          this.value = formatNumber(value);
        } else {
          this.value = '';
        }
      });
    });

    // محاسبه خودکار قیمت کلی برای آپارتمان
    document.getElementById('unitArea-apartment').addEventListener('input', calculateApartmentTotalPrice);
    document.getElementById('pricePerMeter-apartment').addEventListener('input', calculateApartmentTotalPrice);

    // محاسبه خودکار قیمت کلی برای زمین
    document.getElementById('landArea-land').addEventListener('input', calculateLandTotalPrice);
    document.getElementById('pricePerMeter-land').addEventListener('input', calculateLandTotalPrice);

    // محاسبه خودکار قیمت کلی برای تجاری
    document.getElementById('shopArea').addEventListener('input', calculateCommercialTotalPrice);
    document.getElementById('pricePerMeter-commercial').addEventListener('input', calculateCommercialTotalPrice);

    // رویدادهای دکمه‌ها
    document.getElementById('resetBtn').addEventListener('click', showConfirmOverlay);
    document.getElementById('confirmYesBtn').addEventListener('click', resetForm);
    document.getElementById('confirmNoBtn').addEventListener('click', hideConfirmOverlay);
    document.getElementById('closeSuccessBtn').addEventListener('click', hideSuccessOverlay);
    document.getElementById('closeErrorBtn').addEventListener('click', hideErrorOverlay);

    // رویدادهای منوی همبرگری
    document.getElementById('hamburgerMenu').addEventListener('click', showMenuOverlay);
    document.getElementById('menuClose').addEventListener('click', hideMenuOverlay);

    // ارسال فرم
    document.getElementById('propertyForm').addEventListener('submit', handleFormSubmit);

    // رویدادهای ورودی برای بررسی خطاها در زمان تایپ
    document.querySelectorAll('input[required], textarea[required]').forEach(input => {
      input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
          hideFieldError(this.id);
          // بررسی آیا همه خطاها برطرف شده‌اند
          checkAndHideErrorsContainer();
        }
      });
    });

    // رویدادهای چک باکس‌های شرایط فروش
    document.querySelectorAll('input[name="saleConditions"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const propertyType = getSelectedPropertyType();
        if (propertyType) {
          const errorId = `saleConditions-${propertyType}Error`;          const errorElement = document.getElementById(errorId);
          if (errorElement) errorElement.classList.add('hidden');
          // بررسی آیا همه خطاها برطرف شده‌اند
          checkAndHideErrorsContainer();
        }
      });
    });

    // رویدادهای رادیو باتن‌های وضعیت سند
    document.querySelectorAll('input[name="document"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const propertyType = getSelectedPropertyType();
        if (propertyType) {
          const errorId = `document-${propertyType}Error`;
           const errorElement = document.getElementById(errorId);
           if (errorElement) errorElement.classList.add('hidden');
          // بررسی آیا همه خطاها برطرف شده‌اند
          checkAndHideErrorsContainer();
        }
      });
    });

    // رویدادهای رادیو باتن‌های نوع ملک
    document.querySelectorAll('input[name="propertyType"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const errorElement = document.getElementById('typeError');
        if (errorElement) errorElement.classList.add('hidden');
        // بررسی آیا همه خطاها برطرف شده‌اند
        checkAndHideErrorsContainer();
      });
    });
     // رویدادهای رادیو باتن‌های نوع پیش‌فروش
    document.querySelectorAll('input[name="presaleType"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const errorElement = document.getElementById('presaleTypeError');
        if (errorElement) errorElement.classList.add('hidden');
        // بررسی آیا همه خطاها برطرف شده‌اند
        checkAndHideErrorsContainer();
      });
    });
  }

  // تابع کمکی برای فرمت کردن اعداد با جداکننده هزارگان
  function formatNumber(num) {
    // مطمئن شوید که ورودی یک رشته است
    num = String(num);
    // حذف کاماهای موجود برای جلوگیری از فرمت مجدد نادرست
    num = num.replace(/,/g, '');
    // اضافه کردن کاماها
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  // تابع کمکی برای حذف جداکننده‌های هزارگان و تبدیل به عدد
  function unformatNumber(formattedNum) {
    if (typeof formattedNum !== 'string') return NaN; // فقط روی رشته کار می‌کند
    return parseInt(formattedNum.replace(/,/g, ''), 10);
  }

  // بررسی و مخفی کردن کادر خطاها اگر همه خطاها برطرف شده باشند
  function checkAndHideErrorsContainer() {
    // بررسی آیا هیچ خطای نمایش داده شده‌ای وجود دارد
    const visibleErrors = document.querySelectorAll('.error:not(.hidden)');
    const errorsList = document.getElementById('errorsList');

    if (visibleErrors.length === 0 && errorsList && errorsList.children.length === 0) {
      const validationErrorsContainer = document.getElementById('validationErrors');
      if (validationErrorsContainer) validationErrorsContainer.classList.add('hidden');
    }
  }

  // محاسبه قیمت کلی آپارتمان - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-apartment').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-apartment').value.trim();
    const totalPriceField = document.getElementById('totalPrice-apartment');

    if (unitArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(unitArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        const totalPrice = area * price;
        totalPriceField.value = formatNumber(totalPrice);
         // پاک کردن خطای قیمت کل در صورت محاسبه
         hideFieldError('totalPrice-apartment');
      } else {
           // اگر ورودی‌ها معتبر نیستند، ممکن است بخواهید فیلد قیمت کل را پاک کنید یا به کاربر هشدار دهید
          // totalPriceField.value = ''; // یا نمایش یک پیام
      }
    }
     // اگر قیمت متری پاک شد، قیمت کل را پاک نکنید، کاربر ممکن است دستی وارد کند
  }

  // محاسبه قیمت کلی زمین - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateLandTotalPrice() {
    const landArea = document.getElementById('landArea-land').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-land').value.trim();
    const totalPriceField = document.getElementById('totalPrice-land');

    if (landArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(landArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        const totalPrice = area * price;
        totalPriceField.value = formatNumber(totalPrice);
         // پاک کردن خطای قیمت کل در صورت محاسبه
         hideFieldError('totalPrice-land');
      }
    }
  }

  // محاسبه قیمت کلی تجاری - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateCommercialTotalPrice() {
    const shopArea = document.getElementById('shopArea').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-commercial').value.trim();
    const totalPriceField = document.getElementById('totalPrice-commercial');

    if (shopArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(shopArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        const totalPrice = area * price;
        totalPriceField.value = formatNumber(totalPrice);
         // پاک کردن خطای قیمت کل در صورت محاسبه
         hideFieldError('totalPrice-commercial');      }
    }
  }
   // محاسبه قیمت کلی پیش‌فروش آپارتمان
  function calculatePresaleApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-presale-apartment').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-presale-apartment').value.trim();
    const totalPriceField = document.getElementById('totalPrice-presale-apartment');

    if (unitArea && pricePerMeter) {
        const area = unformatNumber(unitArea);
        const price = unformatNumber(pricePerMeter);

        if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
            const totalPrice = area * price;
            totalPriceField.value = formatNumber(totalPrice);
            hideFieldError('totalPrice-presale-apartment');
        }
    }
  }

  // اضافه کردن event listenerها برای محاسبه خودکار قیمت پیش‌فروش آپارتمان
  document.getElementById('unitArea-presale-apartment').addEventListener('input', calculatePresaleApartmentTotalPrice);
  document.getElementById('pricePerMeter-presale-apartment').addEventListener('input', calculatePresaleApartmentTotalPrice);


  // تغییر نوع ملک
  function handlePropertyTypeChange() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return; // اگر هیچ دکمه‌ای انتخاب نشده باشد

    const selectedType = selectedTypeInput.value;

    // مخفی کردن همه بخش‌های جزئیات
    Object.values(detailSections).forEach(section => {
      if (section) section.classList.add('hidden');
    });
    Object.values(presaleDetailSections).forEach(section => {
      if (section) section.classList.add('hidden');
    });

    // نمایش بخش جزئیات مربوط به نوع انتخاب شده
    if (detailSections[selectedType]) {
      detailSections[selectedType].classList.remove('hidden');
    }
    // پاک کردن خطاها
    const typeErrorElement = document.getElementById('typeError');
    if (typeErrorElement) typeErrorElement.classList.add('hidden');

    // پخش صدای دینگ
    playSound('dingSound');
  }

  // تغییر نوع پیش‌فروش
  function handlePresaleTypeChange() {
     const selectedTypeInput = document.querySelector('input[name="presaleType"]:checked');
     if (!selectedTypeInput) return; // اگر هیچ دکمه‌ای انتخاب نشده باشد

    const selectedType = selectedTypeInput.value;

    // مخفی کردن همه بخش‌های جزئیات پیش‌فروش
    Object.values(presaleDetailSections).forEach(section => {
     if (section) section.classList.add('hidden');
    });

    // نمایش بخش جزئیات مربوط به نوع پیش‌فروش انتخاب شده
    if (presaleDetailSections[selectedType]) {
      presaleDetailSections[selectedType].classList.remove('hidden');
    }

    // پاک کردن خطاها
    const presaleTypeErrorElement = document.getElementById('presaleTypeError');
    if (presaleTypeErrorElement) presaleTypeErrorElement.classList.add('hidden');

    // پخش صدای دینگ
    playSound('dingSound');
  }

  // ارسال فرم
  async function handleFormSubmit(e) {
    e.preventDefault();

    // اعتبارسنجی فرم
    if (!validateForm()) {
      return;
    }

    // نمایش پیام در حال ارسال با نوار پیشرفت
    showSendingOverlayWithProgress();

    try {
      // شبیه‌سازی پیشرفت ارسال
      await simulateProgress();

      // جمع‌آوری اطلاعات فرم
      const formData = collectFormData();

      // ارسال ایمیل با EmailJS
      await sendEmail(formData);

      // نمایش پیام موفقیت
      hideOverlay('sendingOverlay');
      showSuccessOverlay();

      // پخش صدای موفقیت
      playSound('successSound');

    } catch (error) {
      console.error("Error sending email:", error);

      // نمایش پیام خطا
      hideOverlay('sendingOverlay');
      showErrorOverlay();
    }
  }

  // شبیه‌سازی پیشرفت ارسال
  async function simulateProgress() {
    const progressBar = document.getElementById('sendingProgressBar');
     if (!progressBar) return; // اگر نوار پیشرفت وجود نداشت

    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0); // Reset aria value

    // شبیه‌سازی پیشرفت از 0 تا 100 درصد
    for (let i = 0; i <= 100; i += 5) {
        if (progressBar) { // Check again inside loop in case overlay is closed
            progressBar.style.width = i + '%';
            progressBar.setAttribute('aria-valuenow', i);
        } else {
            break; // Stop simulation if progress bar disappears
        }
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms * 20 steps = 1 second
    }
     // اطمینان از رسیدن به 100%
     if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.setAttribute('aria-valuenow', 100);
     }
  }


  // اعتبارسنجی فرم
  function validateForm() {
    let isValid = true;
    const errors = []; // لیست نام فیلدهای دارای خطا

    // پاک کردن همه خطاها و کادر خطاها
    document.querySelectorAll('.error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
    document.querySelectorAll('.error-field').forEach(el => {
      el.classList.remove('error-field');
    });
    const validationErrorsContainer = document.getElementById('validationErrors');
    const errorsList = document.getElementById('errorsList');
    if (validationErrorsContainer) validationErrorsContainer.classList.add('hidden');
    if (errorsList) errorsList.innerHTML = '';

    // اعتبارسنجی اطلاعات شخصی
    if (!validateField('firstName', 'نام را وارد کنید')) {
      isValid = false;
      errors.push('نام');
    }

    if (!validateField('lastName', 'نام خانوادگی را وارد کنید')) {
      isValid = false;
      errors.push('نام خانوادگی');
    }

    if (!validateField('phone', 'شماره تماس را وارد کنید')) {
      isValid = false;
      errors.push('شماره تماس');
    } else if (!validatePhone('phone')) {
      isValid = false;
      errors.push('شماره تماس (فرمت 09xxxxxxxxx)');
    }

    // اعتبارسنجی نوع ملک
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) {
      const typeErrorElement = document.getElementById('typeError');
      if (typeErrorElement) {
        typeErrorElement.classList.remove('hidden');
        typeErrorElement.textContent = 'لطفاً نوع ملک را انتخاب کنید';
      }
      isValid = false;
      errors.push('نوع ملک');
    } else {
      const selectedType = selectedTypeInput.value;
      let propertyTypeKey = ''; // کلید برای استفاده در توابع اعتبارسنجی

      // اعتبارسنجی بر اساس نوع ملک انتخاب شده
      switch (selectedType) {
        case 'آپارتمان':
          propertyTypeKey = 'apartment';
          break;
        case 'ویلا':
          propertyTypeKey = 'villa';
          break;
        case 'زمین':
          propertyTypeKey = 'land';
          break;
        case 'تجاری / مغازه':
          propertyTypeKey = 'commercial';
          break;
        case 'کلنگی':
          propertyTypeKey = 'old';
          break;
        case 'پیش‌فروش':
          // اعتبارسنجی نوع پیش‌فروش
          const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
          if (!selectedPresaleTypeInput) {
             const presaleTypeErrorElement = document.getElementById('presaleTypeError');
             if (presaleTypeErrorElement) {
                presaleTypeErrorElement.classList.remove('hidden');
                presaleTypeErrorElement.textContent = 'لطفاً نوع پیش‌فروش را انتخاب کنید';
             }
            isValid = false;
            errors.push('نوع پیش‌فروش');
          } else {
            // اعتبارسنجی پیشرفت پروژه
            if (!validateField('projectProgress', 'پیشرفت پروژه را وارد کنید')) {
              isValid = false;
              errors.push('پیشرفت پروژه');
            }

            // تعیین کلید برای اعتبارسنجی جزئیات پیش‌فروش
            const selectedPresaleType = selectedPresaleTypeInput.value;
            if (selectedPresaleType === 'آپارتمان') {
              propertyTypeKey = 'presale-apartment';
            } else if (selectedPresaleType === 'ویلا') {
              propertyTypeKey = 'presale-villa';
            }
          }
          break;
      }

       // اگر یک نوع ملک یا پیش‌فروش معتبر انتخاب شده بود، جزئیات آن را اعتبارسنجی کن
       if (propertyTypeKey && !validatePropertyType(propertyTypeKey)) {
           isValid = false;
           // جمع‌آوری نام فیلدهای دارای خطا از بخش مربوطه
           errors.push(...collectPropertyTypeErrors(propertyTypeKey));
       }
    }

    // اگر خطایی وجود داشت، آنها را نمایش بده
    if (!isValid) {
      // حذف موارد تکراری از لیست خطاها (در صورت وجود)
      const uniqueErrors = [...new Set(errors)];
      showValidationErrors(uniqueErrors);
    }

    return isValid;
  }

  // جمع‌آوری نام فیلدهای دارای خطا برای یک نوع ملک خاص
  function collectPropertyTypeErrors(propertyType) {
    const errorFieldNames = [];
    const requiredFields = getRequiredFieldsForPropertyType(propertyType);

    requiredFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      // بررسی اینکه آیا فیلد الزامی است و خالی است یا خطای error-field دارد
      if (element && element.required && (element.value.trim() === '' || element.classList.contains('error-field'))) {
        const label = document.querySelector(`label[for="${fieldId}"]`);
        if (label) {
          // حذف ستاره الزامی و فضای خالی اضافی از نام لیبل
          const fieldName = label.textContent.replace('*', '').trim();
          errorFieldNames.push(fieldName);
        } else {
            errorFieldNames.push(fieldId); // Fallback to ID if label not found
        }
      }
    });

    // بررسی وضعیت سند
    const documentErrorElement = document.getElementById(`document-${propertyType}Error`);
    if (documentErrorElement && !documentErrorElement.classList.contains('hidden')) {
      errorFieldNames.push('وضعیت سند');
    }

    // بررسی شرایط فروش
    const saleConditionsErrorElement = document.getElementById(`saleConditions-${propertyType}Error`);
    if (saleConditionsErrorElement && !saleConditionsErrorElement.classList.contains('hidden')) {
      errorFieldNames.push('شرایط فروش');
    }

    return errorFieldNames;
  }


  // نمایش خطاهای اعتبارسنجی در کادر خطا
  function showValidationErrors(errors) {
    const errorsList = document.getElementById('errorsList');
    const validationErrorsContainer = document.getElementById('validationErrors');

     if (!errorsList || !validationErrorsContainer) return; // Exit if elements don't exist

    errorsList.innerHTML = ''; // Clear previous errors

     if (errors.length === 0) {
        validationErrorsContainer.classList.add('hidden');
        return;
     }

    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      errorsList.appendChild(li);
    });

    validationErrorsContainer.classList.remove('hidden');

    // اسکرول به بالای کادر خطاها تا در دید قرار گیرد
    validationErrorsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // اعتبارسنجی یک فیلد تکی
  function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return true; // Field doesn't exist, so it's valid in this context

    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;

    if (field.required && field.value.trim() === '') {
      isValid = false;
      field.classList.add('error-field');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
      }
    } else {
       // اگر فیلد الزامی نیست یا پر شده است، خطا را پاک کن
       field.classList.remove('error-field');
       if (errorElement) {
           errorElement.classList.add('hidden');
           errorElement.textContent = '';
       }
    }
    return isValid;
  }


  // اعتبارسنجی شماره تلفن
  function validatePhone(fieldId) {
    const field = document.getElementById(fieldId);
     if (!field) return true; // Skip if field doesn't exist

    const value = field.value.trim();
    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;

     // فقط اگر فیلد مقداری دارد، فرمت آن را بررسی کن
     if (value !== '') {
        // بررسی فرمت شماره تلفن همراه ایران (شروع با 09 و دقیقا 11 رقم)
        if (!/^09\d{9}$/.test(value)) {
          isValid = false;
          field.classList.add('error-field');
          if (errorElement) {
            errorElement.textContent = 'فرمت صحیح شماره موبایل 09xxxxxxxxx است';
            errorElement.classList.remove('hidden');
          }
        } else {
            // اگر فرمت صحیح بود و قبلا خطا داشته، آن را پاک کن
            field.classList.remove('error-field');
            if (errorElement) {                errorElement.classList.add('hidden');
                errorElement.textContent = '';
            }
        }
    } else if (field.required) {
        // اگر فیلد الزامی است و خالی است، تابع validateField قبلا خطا را نشان داده است
        isValid = false; // Ensure it's marked as invalid if required and empty
    } else {
         // اگر الزامی نیست و خالی است، خطای احتمالی قبلی را پاک کن
         field.classList.remove('error-field');
         if (errorElement) {
             errorElement.classList.add('hidden');
             errorElement.textContent = '';
         }
     }

    return isValid;
  }


  // اعتبارسنجی یک نوع ملک خاص (فیلدهای الزامی، رادیو و چک‌باکس)
  function validatePropertyType(propertyType) {    let isValid = true;
    const requiredFields = getRequiredFieldsForPropertyType(propertyType);

    // اعتبارسنجی فیلدهای متنی و عددی الزامی
    requiredFields.forEach(fieldId => {
        // پیام خطا عمومی‌تر شد
      if (!validateField(fieldId, `این فیلد الزامی است`)) {
        isValid = false;
      }
    });

    // اعتبارسنجی وضعیت سند (رادیو باتن)
    const documentRadioName = 'document'; // نام گروه رادیو باتن‌ها
    const documentChecked = document.querySelector(`input[name="${documentRadioName}"][id^="document-${propertyType}"]:checked`);
    const documentErrorElement = document.getElementById(`document-${propertyType}Error`);

    if (!documentChecked) {
      isValid = false;
      if (documentErrorElement) {
        documentErrorElement.textContent = 'لطفاً وضعیت سند را انتخاب کنید';
        documentErrorElement.classList.remove('hidden');
         // Optionally add error class to the container/label if needed
      }
    } else {
      if (documentErrorElement) {
        documentErrorElement.classList.add('hidden');
        documentErrorElement.textContent = '';
      }
    }

    // اعتبارسنجی شرایط فروش (چک باکس)
    const saleConditionsName = 'saleConditions'; // نام گروه چک باکس‌ها
    const saleConditionsChecked = document.querySelector(`input[name="${saleConditionsName}"][id^="saleConditions-${propertyType}"]:checked`);
    const saleConditionsErrorElement = document.getElementById(`saleConditions-${propertyType}Error`);

    if (!saleConditionsChecked) {
      isValid = false;
      if (saleConditionsErrorElement) {
        saleConditionsErrorElement.textContent = 'حداقل یک شرط فروش را انتخاب کنید';
        saleConditionsErrorElement.classList.remove('hidden');
         // Optionally add error class to the container/label if needed
      }
    } else {
      if (saleConditionsErrorElement) {
        saleConditionsErrorElement.classList.add('hidden');
        saleConditionsErrorElement.textContent = '';
      }
    }

    return isValid;
  }


  // دریافت فیلدهای الزامی برای یک نوع ملک خاص
  function getRequiredFieldsForPropertyType(propertyType) {
    switch (propertyType) {
      case 'apartment':
        return ['unitArea-apartment', 'roomCount-apartment', 'buildYear-apartment', 'totalPrice-apartment', 'address-apartment'];
      case 'villa':
        return ['landArea-villa', 'buildingArea-villa', 'roomCount-villa', 'buildYear-villa', 'price-villa', 'address-villa'];
      case 'land':
        return ['landArea-land', 'landUsage', 'totalPrice-land', 'address-land'];
      case 'commercial':
        return ['shopArea', 'totalPrice-commercial', 'address-commercial'];
      case 'old':
        return ['landArea-old', 'buildingArea-old', 'totalPrice-old', 'address-old'];
      case 'presale-apartment':
        // پیشرفت پروژه در اعتبارسنجی اصلی چک می‌شود، اینجا فقط فیلدهای داخل بخش خودش
        return ['unitArea-presale-apartment', 'roomCount-presale-apartment', 'totalPrice-presale-apartment', 'address-presale-apartment'];
      case 'presale-villa':        // پیشرفت پروژه در اعتبارسنجی اصلی چک می‌شود
        return ['landArea-presale-villa', 'buildingArea-presale-villa', 'roomCount-presale-villa', 'floorCount-presale-villa', 'price-presale-villa', 'address-presale-villa'];
      default:
        return [];
    }
  }

  // پنهان کردن خطای یک فیلد
  function hideFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');

    if (field) {
      field.classList.remove('error-field');
    }

    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }
  }

  // دریافت کلید نوع ملک انتخاب شده برای دسترسی به داده‌ها و اعتبارسنجی
  function getSelectedPropertyType() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return null;

    const selectedType = selectedTypeInput.value;

    if (selectedType === 'پیش‌فروش') {
      const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
      if (!selectedPresaleTypeInput) return 'presale'; // Return 'presale' if main type is presale but subtype isn't selected yet
      const selectedPresaleType = selectedPresaleTypeInput.value;
      // کلید ترکیبی برای پیش‌فروش
      return `presale-${selectedPresaleType === 'آپارتمان' ? 'apartment' : 'villa'}`;
    }

    // کلیدهای ساده برای انواع دیگر
    switch (selectedType) {
      case 'آپارتمان': return 'apartment';
      case 'ویلا': return 'villa';
      case 'زمین': return 'land';
      case 'تجاری / مغازه': return 'commercial';
      case 'کلنگی': return 'old';
      default: return null;
    }
  }


  // جمع‌آوری اطلاعات فرم
  function collectFormData() {
    const selectedType = document.querySelector('input[name="propertyType"]:checked').value;
    const data = {
      uniqueId,
      registrationDate: document.getElementById('registrationDate').value, // ****** اضافه کردن تاریخ ثبت ******
      propertyType: selectedType,
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      altPhone: document.getElementById('altPhone').value.trim() || 'وارد نشده'
    };

    // اطلاعات اختصاصی هر نوع ملک
    const propertyTypeKey = getSelectedPropertyType(); // Get the key ('apartment', 'villa', 'presale-apartment', etc.)

    if (propertyTypeKey) {
        // اطلاعات عمومی مشترک (سند، شرایط فروش، آدرس) - با استفاده از کلید
        data.document = getSelectedRadioValue('document', `document-${propertyTypeKey}`);
        data.saleConditions = getCheckedValues('saleConditions', `saleConditions-${propertyTypeKey}`);
        data.saleConditionDetails = document.getElementById(`saleConditionDetails-${propertyTypeKey}`)?.value.trim() || 'وارد نشده';
        data.address = document.getElementById(`address-${propertyTypeKey}`)?.value.trim() || 'وارد نشده';

        // اطلاعات خاص هر نوع
        switch (propertyTypeKey) {
            case 'apartment':
                Object.assign(data, collectApartmentData());
                break;
            case 'villa':
                Object.assign(data, collectVillaData());
                break;
            case 'land':
                Object.assign(data, collectLandData());
                break;
            case 'commercial':
                Object.assign(data, collectCommercialData());
                break;
            case 'old':
                Object.assign(data, collectOldData());
                break;
            case 'presale-apartment':
                data.presaleType = 'آپارتمان'; // Add presale specific type
                data.projectProgress = document.getElementById('projectProgress').value.trim();
                Object.assign(data, collectPresaleApartmentData());
                break;
            case 'presale-villa':
                 data.presaleType = 'ویلا'; // Add presale specific type
                 data.projectProgress = document.getElementById('projectProgress').value.trim();
                Object.assign(data, collectPresaleVillaData());
                break;
             case 'presale': // Handle case where presale type not yet selected (shouldn't happen on submit due to validation)
                 data.projectProgress = document.getElementById('projectProgress').value.trim();
                 break;
        }
    }


    return data;
  }

// --- توابع جمع‌آوری اطلاعات هر بخش (بدون تغییر قابل توجه نسبت به قبل، فقط نحوه فراخوانی در collectFormData تغییر کرد) ---

  // جمع‌آوری اطلاعات آپارتمان
  function collectApartmentData() {
    // سند، شرایط فروش و آدرس در collectFormData اصلی گرفته می‌شود
    return {
      landArea: document.getElementById('landArea-apartment').value.trim() || 'وارد نشده',
      unitArea: document.getElementById('unitArea-apartment').value.trim(),
      roomCount: document.getElementById('roomCount-apartment').value.trim(),
      buildYear: document.getElementById('buildYear-apartment').value.trim(),
      kitchen: getCheckedValues('kitchen-apartment'),
      facilities: getCheckedValues('facilities-apartment'),
      otherFacilities: document.getElementById('otherFacilities-apartment').value.trim() || 'وارد نشده',
      amenities: getCheckedValues('amenities-apartment'),
      otherAmenities: document.getElementById('otherAmenities-apartment').value.trim() || 'وارد نشده',
      commonAreas: getCheckedValues('commonAreas-apartment'),
      otherCommonAreas: document.getElementById('otherCommonAreas-apartment').value.trim() || 'وارد نشده',
      otherDetails: document.getElementById('otherDetails-apartment').value.trim() || 'وارد نشده',
      pricePerMeter: document.getElementById('pricePerMeter-apartment').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-apartment').value.trim(),
      // document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    };
  }

  // جمع‌آوری اطلاعات ویلا
  function collectVillaData() {
    return {
      landArea: document.getElementById('landArea-villa').value.trim(),
      buildingArea: document.getElementById('buildingArea-villa').value.trim(),
      roomCount: document.getElementById('roomCount-villa').value.trim(),
      buildYear: document.getElementById('buildYear-villa').value.trim(),
      kitchen: getCheckedValues('kitchen-villa'),
      facilities: getCheckedValues('facilities-villa'),
      otherFacilities: document.getElementById('otherFacilities-villa').value.trim() || 'وارد نشده',
      amenities: getCheckedValues('amenities-villa'),
      otherAmenities: document.getElementById('otherAmenities-villa').value.trim() || 'وارد نشده',
      otherDetails: document.getElementById('otherDetails-villa').value.trim() || 'وارد نشده',
      price: document.getElementById('price-villa').value.trim(), // Villa has 'price' not 'totalPrice'
       // document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    };
  }

  // جمع‌آوری اطلاعات زمین
  function collectLandData() {
    return {
      landArea: document.getElementById('landArea-land').value.trim(),
      landUsage: document.getElementById('landUsage').value.trim(),
      landWidth: document.getElementById('landWidth').value.trim() || 'وارد نشده',
      landDepth: document.getElementById('landDepth').value.trim() || 'وارد نشده',
      alleyWidth: document.getElementById('alleyWidth').value.trim() || 'وارد نشده',
      enclosed: getSelectedRadioValue('enclosed') || 'وارد نشده', // Name is unique here
      otherDetails: document.getElementById('otherDetails-land').value.trim() || 'وارد نشده',
      pricePerMeter: document.getElementById('pricePerMeter-land').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-land').value.trim(),
       // document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    };
  }

  // جمع‌آوری اطلاعات تجاری / مغازه
  function collectCommercialData() {
    return {
      shopArea: document.getElementById('shopArea').value.trim(),
      shopHeight: document.getElementById('shopHeight').value.trim() || 'وارد نشده',
      shopWidth: document.getElementById('shopWidth').value.trim() || 'وارد نشده',
      shopDetails: document.getElementById('shopDetails').value.trim() || 'وارد نشده',
      otherDetails: document.getElementById('otherDetails-commercial').value.trim() || 'وارد نشده', // Note: ID is specific
      pricePerMeter: document.getElementById('pricePerMeter-commercial').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-commercial').value.trim(),
       // document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    };
  }

  // جمع‌آوری اطلاعات کلنگی
  function collectOldData() {
    return {
      landArea: document.getElementById('landArea-old').value.trim(),
      buildingArea: document.getElementById('buildingArea-old').value.trim(),
      landWidth: document.getElementById('landWidth-old').value.trim() || 'وارد نشده',
      landDepth: document.getElementById('landDepth-old').value.trim() || 'وارد نشده',
      livability: getSelectedRadioValue('livability') || 'وارد نشده', // Name is unique
      utilities: getCheckedValues('utilities'), // Name is unique
      amenities: document.getElementById('amenities-old').value.trim() || 'وارد نشده', // Textarea has specific ID
      pricePerMeter: document.getElementById('pricePerMeter-old').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-old').value.trim(),
       // document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    };
  }

  // جمع‌آوری اطلاعات پیش‌فروش آپارتمان
  function collectPresaleApartmentData() {
     // projectProgress, document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    return {
      landArea: document.getElementById('landArea-presale-apartment').value.trim() || 'وارد نشده',
      unitArea: document.getElementById('unitArea-presale-apartment').value.trim(),
      roomCount: document.getElementById('roomCount-presale-apartment').value.trim(),
      floorCount: document.getElementById('floorCount-presale-apartment').value.trim() || 'وارد نشده',
      floorNumber: document.getElementById('floorNumber-presale-apartment').value.trim() || 'وارد نشده',
      unitsPerFloor: document.getElementById('unitsPerFloor-presale-apartment').value.trim() || 'وارد نشده',
      moreDetails: document.getElementById('moreDetails-presale-apartment').value.trim() || 'وارد نشده',
      kitchen: getCheckedValues('kitchen-presale-apartment'),
      otherDetails: document.getElementById('otherDetails-presale-apartment').value.trim() || 'وارد نشده',
      pricePerMeter: document.getElementById('pricePerMeter-presale-apartment').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-presale-apartment').value.trim(),
    };
  }

  // جمع‌آوری اطلاعات پیش‌فروش ویلا
  function collectPresaleVillaData() {
     // projectProgress, document, saleConditions, saleConditionDetails, address are collected in main collectFormData
    return {
      landArea: document.getElementById('landArea-presale-villa').value.trim(),
      buildingArea: document.getElementById('buildingArea-presale-villa').value.trim(),
      roomCount: document.getElementById('roomCount-presale-villa').value.trim(),
      floorCount: document.getElementById('floorCount-presale-villa').value.trim(),
      kitchen: getCheckedValues('kitchen-presale-villa'),
      otherDetails: document.getElementById('otherDetails-presale-villa').value.trim() || 'وارد نشده',
      price: document.getElementById('price-presale-villa').value.trim(), // Presale villa has 'price'
    };  }


  // دریافت مقادیر انتخاب شده چک باکس‌ها (با قابلیت دریافت پیشوند ID)
  function getCheckedValues(name, idPrefix = null) {
      const selector = idPrefix
          ? `input[name="${name}"][id^="${idPrefix}"]:checked`          : `input[name="${name}"]:checked`;
    const checkboxes = document.querySelectorAll(selector);
    if (checkboxes.length === 0) return 'هیچکدام';
    return Array.from(checkboxes).map(cb => cb.value).join('، ');
  }

  // دریافت مقدار انتخاب شده رادیو باتن‌ها (با قابلیت دریافت پیشوند ID)
  function getSelectedRadioValue(name, idPrefix = null) {
      const selector = idPrefix
          ? `input[name="${name}"][id^="${idPrefix}"]:checked`          : `input[name="${name}"]:checked`;
    const radio = document.querySelector(selector);
    return radio ? radio.value : '';
  }

  // --- تابع اصلاح شده sendEmail ---
  async function sendEmail(formData) {
    // تابع کمکی برای فرمت قیمت
    const formatPrice = (priceString) => {
      if (!priceString || priceString === 'وارد نشده' || priceString.trim() === '') {
        return 'وارد نشده';
      }
      // حذف کاراکترهای غیر عددی (مثل کاما) برای تبدیل به عدد
      const numericValue = unformatNumber(priceString);
      if (isNaN(numericValue)) {
        return 'نامعتبر'; // اگر تبدیل ناموفق بود
      }
      return formatNumber(numericValue) + " تومان";
    };

     // تابع کمکی برای فرمت مقادیر عددی (متراژ، تعداد و ...)
     const formatMetric = (value, unit = '') => {
         if (!value || value === 'وارد نشده' || String(value).trim() === '') {
             return 'وارد نشده';
         }
         // اگر واحدی وجود دارد، آن را اضافه کن
         return String(value).trim() + (unit ? ` ${unit}` : '');
     };

    // ایجاد آبجکت templateParams
    const templateParams = {
      to_name: "املاک معین", // نام گیرنده      subject: `ثبت ملک جدید (${formData.propertyType}) - ${formData.firstName} ${formData.lastName}`, // موضوع ایمیل
      reply_to: "no-reply@example.com", // ایمیل پاسخ (اختیاری)

      // مپ کردن فیلدهای اصلی
      unique_id: formData.uniqueId,
      registration_date: formData.registrationDate || 'نامشخص', // ***** تاریخ ثبت *****
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      altPhone: formData.altPhone || 'وارد نشده',      property_type: formData.propertyType, // نوع کلی ملک
      documentType: formData.document || 'وارد نشده', // وضعیت سند
      address: formData.address || 'وارد نشده', // آدرس
      saleConditions: formData.saleConditions || 'هیچکدام', // شرایط فروش (چک‌باکس‌ها)
      saleConditionDetails: formData.saleConditionDetails || 'ندارد', // توضیحات شرایط فروش

      // --- قیمت‌ها (با فرمت) ---
      // مقدار 'price' برای ویلا و پیش‌فروش ویلا استفاده می‌شود
      // مقدار 'totalPrice' برای آپارتمان، زمین، تجاری، کلنگی، پیش‌فروش آپارتمان
      // مقدار 'pricePerMeter' برای آپارتمان، زمین، تجاری، کلنگی، پیش‌فروش آپارتمان
      price: formatPrice(formData.price),
      totalPrice: formatPrice(formData.totalPrice),
      pricePerMeter: formatPrice(formData.pricePerMeter),

      // --- فیلدهای پیش‌فروش (اگر نوع ملک پیش‌فروش باشد) ---
      presaleType: formData.presaleType || '', // نوع پیش‌فروش (آپارتمان یا ویلا)
      projectProgress: formData.projectProgress ? formatMetric(formData.projectProgress) : '', // پیشرفت پروژه

      // --- جزئیات خاص هر نوع ملک (در بخش‌های جداگانه) ---
      // این بخش‌ها فقط در صورتی پر می‌شوند که نوع ملک مطابقت داشته باشد
      apartmentDetails: '',
      villaDetails: '',
      landDetails: '',
      commercialDetails: '',
      oldDetails: '',
      presaleApartmentDetails: '',
      presaleVillaDetails: ''
    };

    // پر کردن بخش جزئیات مربوطه بر اساس نوع ملک با استفاده از تابع کمکی
    const propertyTypeKey = getSelectedPropertyType(); // Get the specific key again
    if (propertyTypeKey) {
        switch (propertyTypeKey) {
            case 'apartment':
                templateParams.apartmentDetails = formatDetailsForEmail(formData, 'apartment', formatMetric);
                break;
            case 'villa':
                templateParams.villaDetails = formatDetailsForEmail(formData, 'villa', formatMetric);
                break;
            case 'land':
                templateParams.landDetails = formatDetailsForEmail(formData, 'land', formatMetric);
                break;
            case 'commercial':
                templateParams.commercialDetails = formatDetailsForEmail(formData, 'commercial', formatMetric);
                break;
            case 'old':
                templateParams.oldDetails = formatDetailsForEmail(formData, 'old', formatMetric);
                break;
            case 'presale-apartment':
                templateParams.presaleApartmentDetails = formatDetailsForEmail(formData, 'presaleApartment', formatMetric);
                break;
            case 'presale-villa':                templateParams.presaleVillaDetails = formatDetailsForEmail(formData, 'presaleVilla', formatMetric);
                break;
        }
    }


    console.log("Sending templateParams:", templateParams); // برای دیباگ کردن پارامترهای ارسالی

    // ارسال به EmailJS با آبجکت templateParams
    //                  شناسه سرویس صحیح ---->  <---- شناسه قالب
    return emailjs.send("service_rds9l25", "template_5do0c0n", templateParams);
  }

  // --- تابع کمکی جدید برای فرمت جزئیات برای ایمیل ---
  // formatMetric تابع کمکی برای فرمت اعداد و واحدها است
  function formatDetailsForEmail(data, type, formatMetric) {
    let details = '';
    switch (type) {
      case 'apartment':
        details += `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ واحد: ${formatMetric(data.unitArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `سال ساخت: ${formatMetric(data.buildYear)}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}\n`;
        details += ` - سایر تاسیسات: ${data.otherFacilities || 'ندارد'}\n`;
        details += `امکانات: ${data.amenities || 'وارد نشده'}\n`;
        details += ` - سایر امکانات: ${data.otherAmenities || 'ندارد'}\n`;
        details += `مشاعات: ${data.commonAreas || 'وارد نشده'}\n`;
        details += ` - سایر مشاعات: ${data.otherCommonAreas || 'ندارد'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}\n`;
        break;

      case 'villa':
        details += `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنا: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `سال ساخت: ${formatMetric(data.buildYear)}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}\n`;
        details += ` - سایر تاسیسات: ${data.otherFacilities || 'ندارد'}\n`;
        details += `امکانات ویلا: ${data.amenities || 'وارد نشده'}\n`; // Amenities specific to villa
        details += ` - سایر امکانات: ${data.otherAmenities || 'ندارد'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}\n`;
        break;

      case 'land':
        details += `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `کاربری: ${data.landUsage || 'وارد نشده'}\n`;
        details += `بَر زمین: ${formatMetric(data.landWidth, 'متر')}\n`;
        details += `عمق زمین: ${formatMetric(data.landDepth, 'متر')}\n`;
        details += `عرض کوچه: ${formatMetric(data.alleyWidth, 'متر')}\n`;
        details += `محصور: ${data.enclosed || 'وارد نشده'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}\n`;
        break;

      case 'commercial':
        details += `متراژ مغازه: ${formatMetric(data.shopArea, 'متر')}\n`;
        details += `ارتفاع مغازه: ${formatMetric(data.shopHeight, 'متر')}\n`;
        details += `دهنه مغازه: ${formatMetric(data.shopWidth, 'متر')}\n`;
        details += `توضیحات شکل: ${data.shopDetails || 'ندارد'}\n\n`;
        details += `امکانات مغازه: ${data.otherDetails || 'وارد نشده'}\n`; // 'otherDetails' here refers to commercial amenities
        break;

      case 'old':
        details += `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنای موجود: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `بَر زمین: ${formatMetric(data.landWidth, 'متر')}\n`;
        details += `عمق زمین: ${formatMetric(data.landDepth, 'متر')}\n`;
        details += `وضعیت سکونت بنا: ${data.livability || 'وارد نشده'}\n`;
        details += `امتیازات موجود: ${data.utilities || 'وارد نشده'}\n`;
        details += `امکانات بنای موجود: ${data.amenities || 'ندارد'}\n`; // 'amenities' here is the textarea for old building
        break;

      case 'presaleApartment':
        details += `متراژ زمین پروژه: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ واحد: ${formatMetric(data.unitArea, 'متر')}\n`;
        details += `تعداد اتاق: ${formatMetric(data.roomCount)}\n`;
        details += `تعداد کل طبقات: ${formatMetric(data.floorCount)}\n`;
        details += `طبقه واحد: ${formatMetric(data.floorNumber)}\n`;
        details += `تعداد واحد در طبقه: ${formatMetric(data.unitsPerFloor)}\n\n`;
        details += `توضیحات بیشتر پروژه: ${data.moreDetails || 'ندارد'}\n`;
        details += `مشخصات آشپزخانه (تحویلی): ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات/امکانات (تحویلی): ${data.otherDetails || 'ندارد'}\n`;
        break;

      case 'presaleVilla':
        details += `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنا: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `تعداد طبقات: ${formatMetric(data.floorCount)}\n\n`;
        details += `مشخصات آشپزخانه (تحویلی): ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات/امکانات (تحویلی): ${data.otherDetails || 'ندارد'}\n`;
        break;
    }
    // جایگزینی خطوط جدید خالی اضافه برای خوانایی بهتر
    return details.trim().replace(/\n\n+/g, '\n\n');
  }


  // تولید شناسه یکتا
  function generateUniqueId() {
    // ترکیبی از عدد تصادفی و زمان برای یکتایی بیشتر
    return Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
  }

  // پخش صدا
  function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0; // Reset sound to start
      sound.play().catch(error => console.warn("Sound play interrupted or failed:", error)); // Use warn for less critical errors
    }
  }

  // نمایش پیام در حال ارسال با نوار پیشرفت
  function showSendingOverlayWithProgress() {
    const sendingOverlay = document.getElementById('sendingOverlay');
    if (!sendingOverlay) return;

    const overlayContent = sendingOverlay.querySelector('.overlay-content');
    if (!overlayContent) return;

    // حذف نوار پیشرفت قبلی اگر وجود دارد
    const existingProgressContainer = document.getElementById('sendingProgressContainer');
    if (existingProgressContainer) {
        existingProgressContainer.remove();
    }

    // ایجاد نوار پیشرفت جدید
    const progressContainer = document.createElement('div');
    progressContainer.id = 'sendingProgressContainer';
    progressContainer.className = 'progress mt-3'; // Margin top 3
    progressContainer.style.height = '20px';
    progressContainer.style.backgroundColor = '#e9ecef'; // Light grey background
    progressContainer.setAttribute('role', 'progressbar');
    progressContainer.setAttribute('aria-valuemin', '0');
    progressContainer.setAttribute('aria-valuemax', '100');
    progressContainer.setAttribute('aria-valuenow', '0');


    const progressBar = document.createElement('div');
    progressBar.id = 'sendingProgressBar';
    // استفاده از رنگ سبز بوت‌استرپ و انیمیشن راه راه
    progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.1s linear'; // Smoother transition for progress bar    progressContainer.appendChild(progressBar);
    overlayContent.appendChild(progressContainer); // Add to the content


    showOverlay('sendingOverlay'); // نمایش پیام
  }


  // نمایش پیام موفقیت (با نمایش شناسه یکتا)
  function showSuccessOverlay() {
    const uniqueIdDisplay = document.getElementById('uniqueIdDisplay');
     const uniqueIdContainer = document.getElementById('uniqueIdContainer'); // Get the container
    if (uniqueIdDisplay) {
        uniqueIdDisplay.textContent = uniqueId;
    }
     // اگر میخواهید شناسه نمایش داده شود، کلاس hidden را از کانتینر بردارید
     // if (uniqueIdContainer) {
     //    uniqueIdContainer.classList.remove('hidden');
     // }
    showOverlay('successOverlay');
  }


  // نمایش پیام خطا
  function showErrorOverlay() {
    showOverlay('errorOverlay');
  }

  // نمایش پیام تأیید
  function showConfirmOverlay() {
    showOverlay('confirmOverlay');
  }

  // مخفی کردن پیام تأیید
  function hideConfirmOverlay() {
    hideOverlay('confirmOverlay');
  }  // مخفی کردن پیام موفقیت و ریست فرم
  function hideSuccessOverlay() {
    hideOverlay('successOverlay');
    resetForm(); // فرم پس از بستن پیام موفقیت ریست شود
  }

  // مخفی کردن پیام خطا
  function hideErrorOverlay() {
    hideOverlay('errorOverlay');
     // ممکن است بخواهید اینجا فرم را ریست نکنید تا کاربر بتواند دوباره تلاش کند
  }

  // نمایش منوی همبرگری
  function showMenuOverlay() {
    showOverlay('menuOverlay');
  }

  // مخفی کردن منوی همبرگری
  function hideMenuOverlay() {
    hideOverlay('menuOverlay');
  }

  // نمایش یک پیام (Overlay)
  function showOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.style.display = 'flex'; // Use flex for centering content
    }
  }

  // مخفی کردن یک پیام (Overlay)
  function hideOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.style.display = 'none';
    }
  }

  // پاک کردن فرم
  function resetForm() {
    document.getElementById('propertyForm').reset();

    // مخفی کردن همه بخش‌های جزئیات
    Object.values(detailSections).forEach(section => {
      if (section) section.classList.add('hidden');
    });
    Object.values(presaleDetailSections).forEach(section => {
      if (section) section.classList.add('hidden');
    });

    // پاک کردن همه خطاها
    document.querySelectorAll('.error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
    document.querySelectorAll('.error-field').forEach(el => {
      el.classList.remove('error-field');
    });

    // مخفی کردن کادر خطاهای اعتبارسنجی
    const validationErrors = document.getElementById('validationErrors');
    if (validationErrors) validationErrors.classList.add('hidden');
    const errorsList = document.getElementById('errorsList');
    if (errorsList) errorsList.innerHTML = '';

    // تولید شناسه یکتای جدید
    uniqueId = generateUniqueId();

     // ******** تنظیم مجدد تاریخ شمسی در فیلد تاریخ ********
     setJalaliDate();

    // مخفی کردن پیام تأیید (اگر باز بود)
    hideConfirmOverlay();

    // اسکرول به بالای صفحه
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});