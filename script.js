document.addEventListener('DOMContentLoaded', function() {
  // تنظیمات EmailJS
  (function() {
    emailjs.init({
      publicKey: "7zOCMQKI0bRjmv6cn", // کلید عمومی اصلاح شده
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

    // فرمت قیمت با جدا کننده هزارگان - اصلاح شده برای فقط اعداد
    document.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('input', function() {
        // حذف همه کاراکترهای غیر عددی
        let value = this.value.replace(/[^0-9]/g, '');
        
        // اگر مقدار خالی نیست، آن را فرمت کنیم
        if (value) {
          // تبدیل به عدد و سپس فرمت با جداکننده هزارگان
          this.value = Number(value).toLocaleString();
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

  // بررسی و مخفی کردن کادر خطاها اگر همه خطاها برطرف شده باشند
  function checkAndHideErrorsContainer() {
    // بررسی آیا هیچ خطای نمایش داده شده‌ای وجود دارد
    const visibleErrors = document.querySelectorAll('.error:not(.hidden)');
    if (visibleErrors.length === 0) {
      document.getElementById('validationErrors').classList.add('hidden');
    }
  }

  // محاسبه قیمت کلی آپارتمان
  function calculateApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-apartment').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-apartment').value.trim();
    
    if (unitArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = parseInt(unitArea.replace(/[^\d]/g, ''));
      const price = parseInt(pricePerMeter.replace(/[^\d]/g, ''));
      
      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-apartment').value = totalPrice.toLocaleString();
      }
    }
  }

  // محاسبه قیمت کلی زمین
  function calculateLandTotalPrice() {
    const landArea = document.getElementById('landArea-land').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-land').value.trim();
    
    if (landArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = parseInt(landArea.replace(/[^\d]/g, ''));
      const price = parseInt(pricePerMeter.replace(/[^\d]/g, ''));
      
      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-land').value = totalPrice.toLocaleString();
      }
    }
  }

  // محاسبه قیمت کلی تجاری
  function calculateCommercialTotalPrice() {
    const shopArea = document.getElementById('shopArea').value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-commercial').value.trim();
    
    if (shopArea && pricePerMeter) {
      // تبدیل مقادیر به اعداد (حذف جداکننده‌های هزارگان)
      const area = parseInt(shopArea.replace(/[^\d]/g, ''));
      const price = parseInt(pricePerMeter.replace(/[^\d]/g, ''));
      
      if (!isNaN(area) && !isNaN(price)) {
        const totalPrice = area * price;
        document.getElementById('totalPrice-commercial').value = totalPrice.toLocaleString();
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
      return `presale-${selectedPresaleType.value}`;
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
      enclosed: getSelectedRadioValue('enclosed') || 'وارد نشده',
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
      livability: getSelectedRadioValue('livability') || 'وارد نشده',
      utilities: getCheckedValues('utilities'),
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
  function getCheckedValues(name, idPrefix = '') {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (checkboxes.length === 0) return 'هیچکدام';
    
    return Array.from(checkboxes).map(cb => cb.value).join('، ');
  }

  // دریافت مقدار انتخاب شده رادیو باتن‌ها
  function getSelectedRadioValue(name, idPrefix = '') {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
  }

  // ارسال ایمیل با EmailJS
  async function sendEmail(formData) {
    // تبدیل اطلاعات به متن فارسی برای ارسال
    const messageText = formatFormDataForEmail(formData);
    
    // ارسال به تلگرام با استفاده از EmailJS
    const templateParams = {
      to_name: "املاک معین",
      message: messageText,
      unique_id: uniqueId,
      subject: `ثبت ملک جدید - ${formData.firstName} ${formData.lastName}`,
      reply_to: "no-reply@example.com"
    };
    
    return emailjs.send("service_rds9l25", "template_bvx4ixe", templateParams);
  }

  // فرمت کردن اطلاعات فرم برای ارسال ایمیل
  function formatFormDataForEmail(data) {
    let message = `کد شناسه: ${data.uniqueId}\n\n`;
    
    // اطلاعات شخصی
    message += `نام: ${data.firstName}\n`;
    message += `نام خانوادگی: ${data.lastName}\n`;
    message += `شماره تماس: ${data.phone}\n`;
    message += `شماره تماس دیگر: ${data.altPhone}\n\n`;
    
    // نوع ملک
    message += `نوع ملک: ${data.propertyType}\n\n`;
    
    // اطلاعات اختصاصی هر نوع ملک
    switch (data.propertyType) {
      case 'آپارتمان':
        message += formatApartmentData(data);
        break;
      case 'ویلا':
        message += formatVillaData(data);
        break;
      case 'زمین':
        message += formatLandData(data);
        break;
      case 'تجاری / مغازه':
        message += formatCommercialData(data);
        break;
      case 'کلنگی':
        message += formatOldData(data);
        break;
      case 'پیش‌فروش':
        message += `نوع پیش‌فروش: ${data.presaleType}\n`;
        message += `پیشرفت پروژه: ${data.projectProgress}\n\n`;
        
        if (data.presaleType === 'آپارتمان') {
          message += formatPresaleApartmentData(data);
        } else if (data.presaleType === 'ویلا') {
          message += formatPresaleVillaData(data);
        }
        break;
    }
    
    return message;
  }

  // فرمت کردن اطلاعات آپارتمان
  function formatApartmentData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `متراژ واحد: ${data.unitArea} متر\n`;
    message += `تعداد اتاق‌ها: ${data.roomCount}\n`;
    message += `سال ساخت: ${data.buildYear}\n\n`;
    
    message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
    message += `تاسیسات: ${data.facilities}\n`;
    message += `سایر تاسیسات: ${data.otherFacilities}\n`;
    message += `امکانات: ${data.amenities}\n`;
    message += `سایر امکانات: ${data.otherAmenities}\n`;
    message += `مشاعات: ${data.commonAreas}\n`;
    message += `سایر مشاعات: ${data.otherCommonAreas}\n\n`;
    
    message += `سایر توضیحات: ${data.otherDetails}\n\n`;
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
    message += `قیمت کلی: ${data.totalPrice} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات ویلا
  function formatVillaData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `متراژ بنا: ${data.buildingArea} متر\n`;
    message += `تعداد اتاق‌ها: ${data.roomCount}\n`;
    message += `سال ساخت: ${data.buildYear}\n\n`;
    
    message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
    message += `تاسیسات: ${data.facilities}\n`;
    message += `سایر تاسیسات: ${data.otherFacilities}\n`;
    message += `امکانات: ${data.amenities}\n`;
    message += `سایر امکانات: ${data.otherAmenities}\n\n`;
    
    message += `سایر توضیحات: ${data.otherDetails}\n\n`;
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت کلی: ${data.price} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات زمین
  function formatLandData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `کاربری: ${data.landUsage}\n`;
    message += `بَر زمین: ${data.landWidth} متر\n`;
    message += `عمق زمین: ${data.landDepth} متر\n`;
    message += `عرض کوچه: ${data.alleyWidth} متر\n`;
    message += `محصور: ${data.enclosed}\n\n`;
    
    message += `سایر توضیحات: ${data.otherDetails}\n\n`;
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
    message += `قیمت کلی: ${data.totalPrice} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات تجاری / مغازه
  function formatCommercialData(data) {
    let message = '';
    message += `متراژ مغازه: ${data.shopArea} متر\n`;
    message += `ارتفاع مغازه: ${data.shopHeight} متر\n`;
    message += `دهنه مغازه: ${data.shopWidth} متر\n`;
    message += `توضیحات شکل مغازه: ${data.shopDetails}\n\n`;
    
    message += `امکانات: ${data.otherDetails}\n\n`;
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
    message += `قیمت کلی: ${data.totalPrice} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات کلنگی
  function formatOldData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `متراژ بنا: ${data.buildingArea} متر\n`;
    message += `بَر زمین: ${data.landWidth} متر\n`;
    message += `عمق زمین: ${data.landDepth} متر\n`;
    message += `وضعیت سکونت: ${data.livability}\n`;
    message += `امتیازات: ${data.utilities}\n`;
    message += `امکانات: ${data.amenities}\n\n`;
    
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
    message += `قیمت کلی: ${data.totalPrice} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات پیش‌فروش آپارتمان
  function formatPresaleApartmentData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `متراژ واحد: ${data.unitArea} متر\n`;
    message += `تعداد اتاق: ${data.roomCount}\n`;
    message += `تعداد طبقه: ${data.floorCount}\n`;
    message += `طبقه چندم: ${data.floorNumber}\n`;
    message += `تعداد واحد در هر طبقه: ${data.unitsPerFloor}\n\n`;
    
    message += `توضیحات بیشتر: ${data.moreDetails}\n`;
    message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
    message += `سایر توضیحات و امکانات: ${data.otherDetails}\n\n`;
    
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
    message += `قیمت کلی: ${data.totalPrice} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
  }

  // فرمت کردن اطلاعات پیش‌فروش ویلا
  function formatPresaleVillaData(data) {
    let message = '';
    message += `متراژ زمین: ${data.landArea} متر\n`;
    message += `متراژ بنا: ${data.buildingArea} متر\n`;
    message += `تعداد اتاق‌ها: ${data.roomCount}\n`;
    message += `تعداد طبقات: ${data.floorCount}\n\n`;
    
    message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
    message += `سایر توضیحات و امکانات: ${data.otherDetails}\n\n`;
    
    message += `وضعیت سند: ${data.document}\n\n`;
    message += `قیمت کلی: ${data.price} تومان\n\n`;
    message += `شرایط فروش: ${data.saleConditions}\n`;
    message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n\n`;
    message += `آدرس: ${data.address}\n`;
    
    return message;
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
    if (!document.getElementById('sendingProgressContainer')) {
      const progressContainer = document.createElement('div');
      progressContainer.id = 'sendingProgressContainer';
      progressContainer.className = 'progress mt-3';
      progressContainer.style.height = '20px';
      progressContainer.style.width = '100%';
      
      const progressBar = document.createElement('div');
      progressBar.id = 'sendingProgressBar';
      progressBar.className = 'progress-bar bg-success';
      progressBar.style.width = '0%';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuenow', '0');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');
      
      progressContainer.appendChild(progressBar);
      overlayContent.appendChild(progressContainer);
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
    resetForm();
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
      section.classList.add('hidden');
    });
    Object.values(presaleDetailSections).forEach(section => {
      section.classList.add('hidden');
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
    document.getElementById('validationErrors').classList.add('hidden');
    document.getElementById('errorsList').innerHTML = '';
    
    // تولید شناسه یکتای جدید
    uniqueId = generateUniqueId();
    
    // مخفی کردن پیام تأیید
    hideConfirmOverlay();
  }
});