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
        this.value = this.value.replace(/[^آ-یءچحجژ0-9\s.,()-]/g, '');
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
          const errorId = `saleConditions-${propertyType}Error`;
          document.getElementById(errorId).classList.add('hidden');
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
          document.getElementById(errorId).classList.add('hidden');
          // بررسی آیا همه خطاها برطرف شده‌اند
          checkAndHideErrorsContainer();
        }
      });
    });

    // رویدادهای رادیو باتن‌های نوع ملک
    document.querySelectorAll('input[name="propertyType"]').forEach(radio => {
      radio.addEventListener('change', function() {
        document.getElementById('typeError').classList.add('hidden');
        // بررسی آیا همه خطاها برطرف شده‌اند
        checkAndHideErrorsContainer();
      });
    });
  }

  // تابع کمکی برای فرمت کردن اعداد با جداکننده هزارگان
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // تابع کمکی برای حذف جداکننده‌های هزارگان و تبدیل به عدد
  function unformatNumber(formattedNum) {
    return parseInt(formattedNum.replace(/,/g, ''), 10);
  }

  // بررسی و مخفی کردن کادر خطاها اگر همه خطاها برطرف شده باشند
  function checkAndHideErrorsContainer() {
    // بررسی آیا هیچ خطای نمایش داده شده‌ای وجود دارد
    const visibleErrors = document.querySelectorAll('.error:not(.hidden)');
    if (visibleErrors.length === 0) {
      document.getElementById('validationErrors').classList.add('hidden');
    }
  }

  // محاسبه قیمت کلی آپارتمان - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-apartment').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-apartment').value.trim();

    if (unitArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(unitArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-apartment').value = formatNumber(totalPrice);
      }
    }
  }

  // محاسبه قیمت کلی زمین - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateLandTotalPrice() {
    const landArea = document.getElementById('landArea-land').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-land').value.trim();

    if (landArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(landArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-land').value = formatNumber(totalPrice);
      }
    }
  }

  // محاسبه قیمت کلی تجاری - بهبود یافته برای پشتیبانی از اعداد با فرمت
  function calculateCommercialTotalPrice() {
    const shopArea = document.getElementById('shopArea').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-commercial').value.trim();

    if (shopArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = unformatNumber(shopArea);
      const price = unformatNumber(pricePerMeter);

      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-commercial').value = formatNumber(totalPrice);
      }
    }
  }

  // تغییر نوع ملک
  function handlePropertyTypeChange() {
    const selectedType = document.querySelector('input[name="propertyType"]:checked').value;

    // مخفی کردن همه بخش‌های جزئیات
    Object.values(detailSections).forEach(section => {
      section.classList.add('hidden');
    });
    Object.values(presaleDetailSections).forEach(section => {
      section.classList.add('hidden');
    });

    // نمایش بخش جزئیات مربوط به نوع انتخاب شده
    if (detailSections[selectedType]) {
      detailSections[selectedType].classList.remove('hidden');
    }
    // پاک کردن خطاها
    document.getElementById('typeError').classList.add('hidden');

    // پخش صدای دینگ
    playSound('dingSound');
  }

  // تغییر نوع پیش‌فروش
  function handlePresaleTypeChange() {
    const selectedType = document.querySelector('input[name="presaleType"]:checked').value;

    // مخفی کردن همه بخش‌های جزئیات پیش‌فروش
    Object.values(presaleDetailSections).forEach(section => {
      section.classList.add('hidden');
    });

    // نمایش بخش جزئیات مربوط به نوع پیش‌فروش انتخاب شده
    if (presaleDetailSections[selectedType]) {
      presaleDetailSections[selectedType].classList.remove('hidden');
    }

    // پاک کردن خطاها
    document.getElementById('presaleTypeError').classList.add('hidden');

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
    progressBar.style.width = '0%';

    // شبیه‌سازی پیشرفت از 0 تا 100 درصد
    for (let i = 0; i <= 100; i += 5) {
      progressBar.style.width = i + '%';
      progressBar.setAttribute('aria-valuenow', i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // اعتبارسنجی فرم
  function validateForm() {
    let isValid = true;
    const errors = [];

    // پاک کردن همه خطاها
    document.querySelectorAll('.error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
    document.querySelectorAll('.error-field').forEach(el => {
      el.classList.remove('error-field');
    });

    // مخفی کردن کادر خطاهای اعتبارسنجی
    document.getElementById('validationErrors').classList.add('hidden');
    document.getElementById('errorsList').innerHTML = '';

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
      errors.push('شماره تماس (فرمت صحیح نیست)');
    }

    // اعتبارسنجی نوع ملک
    const selectedType = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedType) {
      document.getElementById('typeError').classList.remove('hidden');
      document.getElementById('typeError').textContent = 'لطفاً نوع ملک را انتخاب کنید';
      isValid = false;
      errors.push('نوع ملک');
    } else {
      // اعتبارسنجی بر اساس نوع ملک انتخاب شده
      switch (selectedType.value) {
        case 'آپارتمان':
          if (!validatePropertyType('apartment')) {
            isValid = false;
            errors.push(...collectPropertyTypeErrors('apartment'));
          }
          break;
        case 'ویلا':
          if (!validatePropertyType('villa')) {
            isValid = false;
            errors.push(...collectPropertyTypeErrors('villa'));
          }
          break;
        case 'زمین':
          if (!validatePropertyType('land')) {
            isValid = false;
            errors.push(...collectPropertyTypeErrors('land'));
          }
          break;
        case 'تجاری / مغازه':
          if (!validatePropertyType('commercial')) {
            isValid = false;
            errors.push(...collectPropertyTypeErrors('commercial'));
          }
          break;
        case 'کلنگی':
          if (!validatePropertyType('old')) {
            isValid = false;
            errors.push(...collectPropertyTypeErrors('old'));
          }
          break;
        case 'پیش‌فروش':
          // اعتبارسنجی نوع پیش‌فروش
          const selectedPresaleType = document.querySelector('input[name="presaleType"]:checked');
          if (!selectedPresaleType) {
            document.getElementById('presaleTypeError').classList.remove('hidden');
            document.getElementById('presaleTypeError').textContent = 'لطفاً نوع پیش‌فروش را انتخاب کنید';
            isValid = false;
            errors.push('نوع پیش‌فروش');
          } else {
            // اعتبارسنجی پیشرفت پروژه
            if (!validateField('projectProgress', 'پیشرفت پروژه را وارد کنید')) {
              isValid = false;
              errors.push('پیشرفت پروژه');
            }

            // اعتبارسنجی بر اساس نوع پیش‌فروش انتخاب شده
            switch (selectedPresaleType.value) {
              case 'آپارتمان':
                if (!validatePropertyType('presale-apartment')) {
                  isValid = false;
                  errors.push(...collectPropertyTypeErrors('presale-apartment'));
                }
                break;
              case 'ویلا':
                if (!validatePropertyType('presale-villa')) {
                  isValid = false;
                  errors.push(...collectPropertyTypeErrors('presale-villa'));
                }
                break;
            }
          }
          break;
      }
    }

    // اگر خطایی وجود داشت، آنها را نمایش بده
    if (!isValid) {
      showValidationErrors(errors);
    }

    return isValid;
  }

  // جمع‌آوری خطاهای اعتبارسنجی برای یک نوع ملک خاص
  function collectPropertyTypeErrors(propertyType) {
    const errors = [];
    const requiredFields = getRequiredFieldsForPropertyType(propertyType);

    requiredFields.forEach(field => {
      const element = document.getElementById(field);
      if (element && element.required && element.value.trim() === '') {
        const label = document.querySelector(`label[for="${field}"]`);
        if (label) {
          const fieldName = label.textContent.replace('*', '').trim();
          errors.push(fieldName);
        }
      }
    });

    // بررسی وضعیت سند
    if (!document.querySelector(`input[name="document"][id^="document-${propertyType}"]:checked`)) {
      errors.push('وضعیت سند');
    }

    // بررسی شرایط فروش
    if (!document.querySelector(`input[name="saleConditions"][id^="saleConditions-${propertyType}"]:checked`)) {
      errors.push('شرایط فروش');
    }

    return errors;
  }

  // نمایش خطاهای اعتبارسنجی در کادر خطا
  function showValidationErrors(errors) {
    const errorsList = document.getElementById('errorsList');
    errorsList.innerHTML = '';

    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      errorsList.appendChild(li);
    });

    const validationErrorsContainer = document.getElementById('validationErrors');
    validationErrorsContainer.classList.remove('hidden');

    // اسکرول به بالای کادر خطاها
    validationErrorsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // اعتبارسنجی یک فیلد
  function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return true;

    const errorElement = document.getElementById(fieldId + 'Error');

    if (field.required && field.value.trim() === '') {
      field.classList.add('error-field');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
      }
      return false;
    }

    return true;
  }

  // اعتبارسنجی شماره تلفن
  function validatePhone(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    const errorElement = document.getElementById(fieldId + 'Error');

    // بررسی فرمت شماره تلفن همراه ایران
    if (!/^09\d{9}$/.test(value)) {
      field.classList.add('error-field');
      if (errorElement) {
        errorElement.textContent = 'لطفاً یک شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
        errorElement.classList.remove('hidden');
      }
      return false;
    }

    return true;
  }

  // اعتبارسنجی یک نوع ملک خاص
  function validatePropertyType(propertyType) {
    let isValid = true;
    const requiredFields = getRequiredFieldsForPropertyType(propertyType);

    // اعتبارسنجی فیلدهای الزامی
    requiredFields.forEach(field => {
      if (!validateField(field, `لطفاً این فیلد را پر کنید`)) {
        isValid = false;
      }
    });

    // اعتبارسنجی وضعیت سند
    if (!document.querySelector(`input[name="document"][id^="document-${propertyType}"]:checked`)) {
      document.getElementById(`document-${propertyType}Error`).classList.remove('hidden');
      isValid = false;
    }

    // اعتبارسنجی شرایط فروش
    if (!document.querySelector(`input[name="saleConditions"][id^="saleConditions-${propertyType}"]:checked`)) {
      document.getElementById(`saleConditions-${propertyType}Error`).classList.remove('hidden');
      isValid = false;
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
        return ['unitArea-presale-apartment', 'roomCount-presale-apartment', 'totalPrice-presale-apartment', 'address-presale-apartment'];
      case 'presale-villa':
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

  // دریافت نوع ملک انتخاب شده
  function getSelectedPropertyType() {
    const selectedType = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedType) return null;

    if (selectedType.value === 'پیش‌فروش') {
      const selectedPresaleType = document.querySelector('input[name="presaleType"]:checked');
      if (!selectedPresaleType) return null;
      // اصلاح برای مطابقت با کلیدهای presaleDetailSections
      return `presale-${selectedPresaleType.value === 'آپارتمان' ? 'apartment' : 'villa'}`;
    }

    switch (selectedType.value) {
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
      propertyType: selectedType,
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      altPhone: document.getElementById('altPhone').value.trim() || 'وارد نشده'
    };

    // اطلاعات اختصاصی هر نوع ملک
    switch (selectedType) {
      case 'آپارتمان':
        Object.assign(data, collectApartmentData());
        break;
      case 'ویلا':
        Object.assign(data, collectVillaData());
        break;
      case 'زمین':
        Object.assign(data, collectLandData());
        break;
      case 'تجاری / مغازه':
        Object.assign(data, collectCommercialData());
        break;
      case 'کلنگی':
        Object.assign(data, collectOldData());
        break;
      case 'پیش‌فروش':
        const presaleType = document.querySelector('input[name="presaleType"]:checked').value;
        data.presaleType = presaleType;
        data.projectProgress = document.getElementById('projectProgress').value.trim();

        if (presaleType === 'آپارتمان') {
          Object.assign(data, collectPresaleApartmentData());
        } else if (presaleType === 'ویلا') {
          Object.assign(data, collectPresaleVillaData());
        }
        break;
    }

    return data;
  }

  // جمع‌آوری اطلاعات آپارتمان
  function collectApartmentData() {
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
      document: getSelectedRadioValue('document', 'document-apartment'),
      pricePerMeter: document.getElementById('pricePerMeter-apartment').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-apartment').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-apartment'),
      saleConditionDetails: document.getElementById('saleConditionDetails-apartment').value.trim() || 'وارد نشده',
      address: document.getElementById('address-apartment').value.trim()
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
      document: getSelectedRadioValue('document', 'document-villa'),
      price: document.getElementById('price-villa').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-villa'),
      saleConditionDetails: document.getElementById('saleConditionDetails-villa').value.trim() || 'وارد نشده',
      address: document.getElementById('address-villa').value.trim()
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
      enclosed: getSelectedRadioValue('enclosed', 'enclosed-land') || 'وارد نشده',
      otherDetails: document.getElementById('otherDetails-land').value.trim() || 'وارد نشده',
      document: getSelectedRadioValue('document', 'document-land'),
      pricePerMeter: document.getElementById('pricePerMeter-land').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-land').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-land'),
      saleConditionDetails: document.getElementById('saleConditionDetails-land').value.trim() || 'وارد نشده',
      address: document.getElementById('address-land').value.trim()
    };
  }

  // جمع‌آوری اطلاعات تجاری / مغازه
  function collectCommercialData() {
    return {
      shopArea: document.getElementById('shopArea').value.trim(),
      shopHeight: document.getElementById('shopHeight').value.trim() || 'وارد نشده',
      shopWidth: document.getElementById('shopWidth').value.trim() || 'وارد نشده',
      shopDetails: document.getElementById('shopDetails').value.trim() || 'وارد نشده',
      otherDetails: document.getElementById('otherDetails-commercial').value.trim() || 'وارد نشده',
      document: getSelectedRadioValue('document', 'document-commercial'),
      pricePerMeter: document.getElementById('pricePerMeter-commercial').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-commercial').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-commercial'),
      saleConditionDetails: document.getElementById('saleConditionDetails-commercial').value.trim() || 'وارد نشده',
      address: document.getElementById('address-commercial').value.trim()
    };
  }

  // جمع‌آوری اطلاعات کلنگی
  function collectOldData() {
    return {
      landArea: document.getElementById('landArea-old').value.trim(),
      buildingArea: document.getElementById('buildingArea-old').value.trim(),
      landWidth: document.getElementById('landWidth-old').value.trim() || 'وارد نشده',
      landDepth: document.getElementById('landDepth-old').value.trim() || 'وارد نشده',
      livability: getSelectedRadioValue('livability', 'livability-old') || 'وارد نشده',
      utilities: getCheckedValues('utilities-old'),
      amenities: document.getElementById('amenities-old').value.trim() || 'وارد نشده',
      document: getSelectedRadioValue('document', 'document-old'),
      pricePerMeter: document.getElementById('pricePerMeter-old').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-old').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-old'),
      saleConditionDetails: document.getElementById('saleConditionDetails-old').value.trim() || 'وارد نشده',
      address: document.getElementById('address-old').value.trim()
    };
  }

  // جمع‌آوری اطلاعات پیش‌فروش آپارتمان
  function collectPresaleApartmentData() {
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
      document: getSelectedRadioValue('document', 'document-presale-apartment'),
      pricePerMeter: document.getElementById('pricePerMeter-presale-apartment').value.trim() || 'وارد نشده',
      totalPrice: document.getElementById('totalPrice-presale-apartment').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-presale-apartment'),
      saleConditionDetails: document.getElementById('saleConditionDetails-presale-apartment').value.trim() || 'وارد نشده',
      address: document.getElementById('address-presale-apartment').value.trim()
    };
  }

  // جمع‌آوری اطلاعات پیش‌فروش ویلا
  function collectPresaleVillaData() {
    return {
      landArea: document.getElementById('landArea-presale-villa').value.trim(),
      buildingArea: document.getElementById('buildingArea-presale-villa').value.trim(),
      roomCount: document.getElementById('roomCount-presale-villa').value.trim(),
      floorCount: document.getElementById('floorCount-presale-villa').value.trim(),
      kitchen: getCheckedValues('kitchen-presale-villa'),
      otherDetails: document.getElementById('otherDetails-presale-villa').value.trim() || 'وارد نشده',
      document: getSelectedRadioValue('document', 'document-presale-villa'),
      price: document.getElementById('price-presale-villa').value.trim(),
      saleConditions: getCheckedValues('saleConditions', 'saleConditions-presale-villa'),
      saleConditionDetails: document.getElementById('saleConditionDetails-presale-villa').value.trim() || 'وارد نشده',
      address: document.getElementById('address-presale-villa').value.trim()
    };
  }

  // دریافت مقادیر انتخاب شده چک باکس‌ها
  function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (checkboxes.length === 0) return 'هیچکدام';
    return Array.from(checkboxes).map(cb => cb.value).join('، ');
  }

  // دریافت مقدار انتخاب شده رادیو باتن‌ها
  function getSelectedRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
  }

  // --- تابع اصلاح شده sendEmail ---
  async function sendEmail(formData) {
    // تابع کمکی برای فرمت قیمت
    const formatPrice = (priceString) => {
      if (!priceString || priceString === 'وارد نشده') {
        return 'وارد نشده';
      }
      // حذف کاراکترهای غیر عددی (مثل کاما) برای تبدیل به عدد
      const numericValue = unformatNumber(priceString);
      if (isNaN(numericValue)) {
        return 'وارد نشده'; // اگر تبدیل ناموفق بود
      }
      return formatNumber(numericValue) + " تومان";
    };

    // ایجاد آبجکت templateParams
    const templateParams = {
      to_name: "املاک معین", // نام گیرنده (می‌تواند ثابت باشد)
      subject: `ثبت ملک جدید - ${formData.firstName} ${formData.lastName}`, // موضوع ایمیل
      reply_to: "no-reply@example.com", // ایمیل پاسخ (اختیاری)

      // مپ کردن فیلدهای اصلی
      unique_id: formData.uniqueId,
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      altPhone: formData.altPhone || 'وارد نشده', // مدیریت مقدار پیش‌فرض
      property_type: formData.propertyType,
      documentType: formData.document || '', // نام متغیر در قالب (مطمئن شوید در قالب EmailJS همین نام است)
      address: formData.address || '', // آدرس ممکن است برای همه انواع نباشد
      saleConditions: formData.saleConditions || 'هیچکدام',
      saleConditionDetails: formData.saleConditionDetails || '',

      // مپ کردن قیمت‌ها (با فرمت)
      pricePerMeter: formatPrice(formData.pricePerMeter),
      totalPrice: formatPrice(formData.totalPrice),
      price: formatPrice(formData.price), // قیمت کلی (برای ویلا و پیش‌فروش ویلا)

      // فیلدهای پیش‌فروش
      presaleType: formData.presaleType || '',
      projectProgress: formData.projectProgress ? `${formData.projectProgress}%` : '',

      // جزئیات هر نوع ملک (با استفاده از تابع کمکی جدید)
      apartmentDetails: '',
      villaDetails: '',
      landDetails: '',
      commercialDetails: '',
      oldDetails: '',
      presaleApartmentDetails: '',
      presaleVillaDetails: ''
    };

    // پر کردن بخش جزئیات مربوطه بر اساس نوع ملک
    switch (formData.propertyType) {
      case 'آپارتمان':
        templateParams.apartmentDetails = formatDetailsForEmail(formData, 'apartment');
        break;
      case 'ویلا':
        templateParams.villaDetails = formatDetailsForEmail(formData, 'villa');
        break;
      case 'زمین':
        templateParams.landDetails = formatDetailsForEmail(formData, 'land');
        break;
      case 'تجاری / مغازه':
        templateParams.commercialDetails = formatDetailsForEmail(formData, 'commercial');
        break;
      case 'کلنگی':
        templateParams.oldDetails = formatDetailsForEmail(formData, 'old');
        break;
      case 'پیش‌فروش':
        if (formData.presaleType === 'آپارتمان') {
          templateParams.presaleApartmentDetails = formatDetailsForEmail(formData, 'presaleApartment');
        } else if (formData.presaleType === 'ویلا') {
          templateParams.presaleVillaDetails = formatDetailsForEmail(formData, 'presaleVilla');
        }
        break;
    }

    console.log("Sending templateParams:", templateParams); // برای دیباگ

    // ارسال به EmailJS با آبجکت templateParams
    //                  شناسه سرویس صحیح ---->  <---- شناسه قالب
    return emailjs.send("service_rds9l25", "template_5do0c0n", templateParams);
  }

  // --- تابع کمکی جدید برای فرمت جزئیات ---
  function formatDetailsForEmail(data, type) {
    let details = '';
    switch (type) {
      case 'apartment':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `متراژ واحد: ${data.unitArea || 'وارد نشده'} متر\n`;
        details += `تعداد اتاق‌ها: ${data.roomCount || 'وارد نشده'}\n`;
        details += `سال ساخت: ${data.buildYear || 'وارد نشده'}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}\n`;
        details += `سایر تاسیسات: ${data.otherFacilities || 'وارد نشده'}\n`;
        details += `امکانات: ${data.amenities || 'وارد نشده'}\n`;
        details += `سایر امکانات: ${data.otherAmenities || 'وارد نشده'}\n`;
        details += `مشاعات: ${data.commonAreas || 'وارد نشده'}\n`;
        details += `سایر مشاعات: ${data.otherCommonAreas || 'وارد نشده'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;

      case 'villa':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `متراژ بنا: ${data.buildingArea || 'وارد نشده'} متر\n`;
        details += `تعداد اتاق‌ها: ${data.roomCount || 'وارد نشده'}\n`;
        details += `سال ساخت: ${data.buildYear || 'وارد نشده'}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}\n`;
        details += `سایر تاسیسات: ${data.otherFacilities || 'وارد نشده'}\n`;
        details += `امکانات: ${data.amenities || 'وارد نشده'}\n`;
        details += `سایر امکانات: ${data.otherAmenities || 'وارد نشده'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;

      case 'land':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `کاربری: ${data.landUsage || 'وارد نشده'}\n`;
        details += `بَر زمین: ${data.landWidth || 'وارد نشده'} متر\n`;
        details += `عمق زمین: ${data.landDepth || 'وارد نشده'} متر\n`;
        details += `عرض کوچه: ${data.alleyWidth || 'وارد نشده'} متر\n`;
        details += `محصور: ${data.enclosed || 'وارد نشده'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;

      case 'commercial':
        details += `متراژ مغازه: ${data.shopArea || 'وارد نشده'} متر\n`;
        details += `ارتفاع مغازه: ${data.shopHeight || 'وارد نشده'} متر\n`;
        details += `دهنه مغازه: ${data.shopWidth || 'وارد نشده'} متر\n`;
        details += `توضیحات شکل مغازه: ${data.shopDetails || 'وارد نشده'}\n\n`;
        details += `امکانات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;

      case 'old':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `متراژ بنا: ${data.buildingArea || 'وارد نشده'} متر\n`;
        details += `بَر زمین: ${data.landWidth || 'وارد نشده'} متر\n`;
        details += `عمق زمین: ${data.landDepth || 'وارد نشده'} متر\n`;
        details += `وضعیت سکونت: ${data.livability || 'وارد نشده'}\n`;
        details += `امتیازات: ${data.utilities || 'وارد نشده'}\n`;
        details += `امکانات: ${data.amenities || 'وارد نشده'}\n`;
        break;

      case 'presaleApartment':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `متراژ واحد: ${data.unitArea || 'وارد نشده'} متر\n`;
        details += `تعداد اتاق: ${data.roomCount || 'وارد نشده'}\n`;
        details += `تعداد طبقه: ${data.floorCount || 'وارد نشده'}\n`;
        details += `طبقه چندم: ${data.floorNumber || 'وارد نشده'}\n`;
        details += `تعداد واحد در هر طبقه: ${data.unitsPerFloor || 'وارد نشده'}\n\n`;
        details += `توضیحات بیشتر: ${data.moreDetails || 'وارد نشده'}\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات و امکانات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;

      case 'presaleVilla':
        details += `متراژ زمین: ${data.landArea || 'وارد نشده'} متر\n`;
        details += `متراژ بنا: ${data.buildingArea || 'وارد نشده'} متر\n`;
        details += `تعداد اتاق‌ها: ${data.roomCount || 'وارد نشده'}\n`;
        details += `تعداد طبقات: ${data.floorCount || 'وارد نشده'}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات و امکانات: ${data.otherDetails || 'وارد نشده'}\n`;
        break;
    }
    return details.trim() || ''; // اگر هیچ جزئیاتی نبود، رشته خالی برگردان
  }

  // تولید شناسه یکتا
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 10) + '-' + new Date().getTime().toString(36);
  }

  // پخش صدا
  function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error("Error playing sound:", error));
    }
  }

  // نمایش پیام در حال ارسال با نوار پیشرفت
  function showSendingOverlayWithProgress() {
    // اضافه کردن نوار پیشرفت به پیام در حال ارسال
    const sendingOverlay = document.getElementById('sendingOverlay');
    const overlayContent = sendingOverlay.querySelector('.overlay-content');

    // اگر نوار پیشرفت قبلاً اضافه نشده است
    let progressBar = document.getElementById('sendingProgressBar');
    if (!progressBar) {
      const progressContainer = document.createElement('div');
      progressContainer.id = 'sendingProgressContainer';
      progressContainer.className = 'progress mt-3';
      progressContainer.style.height = '20px';
      progressContainer.style.width = '100%';

      progressBar = document.createElement('div');
      progressBar.id = 'sendingProgressBar';
      progressBar.className = 'progress-bar bg-success';
      progressBar.style.width = '0%';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuenow', '0');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');

      progressContainer.appendChild(progressBar);
      overlayContent.appendChild(progressContainer);
    } else {
       // ریست کردن نوار پیشرفت اگر قبلا وجود داشته
       progressBar.style.width = '0%';
       progressBar.setAttribute('aria-valuenow', '0');
    }

    // نمایش پیام در حال ارسال
    showOverlay('sendingOverlay');
  }

  // نمایش پیام موفقیت
  function showSuccessOverlay() {
    document.getElementById('uniqueIdDisplay').textContent = uniqueId;
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
  }

  // مخفی کردن پیام موفقیت
  function hideSuccessOverlay() {
    hideOverlay('successOverlay');
    resetForm(); // فرم پس از بستن پیام موفقیت ریست شود
  }

  // مخفی کردن پیام خطا
  function hideErrorOverlay() {
    hideOverlay('errorOverlay');
  }

  // نمایش منوی همبرگری
  function showMenuOverlay() {
    showOverlay('menuOverlay');
  }

  // مخفی کردن منوی همبرگری
  function hideMenuOverlay() {
    hideOverlay('menuOverlay');
  }

  // نمایش یک پیام
  function showOverlay(id) {
    document.getElementById(id).style.display = 'flex';
  }

  // مخفی کردن یک پیام
  function hideOverlay(id) {
    document.getElementById(id).style.display = 'none';
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

    // مخفی کردن پیام تأیید (اگر باز بود)
    hideConfirmOverlay();

    // اسکرول به بالای صفحه
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});