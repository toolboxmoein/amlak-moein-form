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
    
    // نمایش پیام در حال ارسال
    showSendingOverlay();
    
    try {
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
          }
          break;
        case 'ویلا':
          if (!validatePropertyType('villa')) {
            isValid = false;
          }
          break;
        case 'زمین':
          if (!validatePropertyType('land')) {
            isValid = false;
          }
          break;
        case 'تجاری / مغازه':
          if (!validatePropertyType('commercial')) {
            isValid = false;
          }
          break;
        case 'کلنگی':
          if (!validatePropertyType('old')) {
            isValid = false;
          }
          break;
        case 'پیش‌فروش':
          // اعتبارسنجی نوع پیش‌فروش
          const selectedPresaleType = document.querySelector('input[name="presaleType"]:checked');
          if (!selectedPresaleType) {
            document.getElementById('presaleTypeError').classList.remove('hidden');
            isValid = false;
            errors.push('نوع پیش‌فروش');
          } else {
            // اعتبارسنجی پروژه در چه مرحله‌ای است
            if (!validateField('projectProgress', 'مرحله پروژه را وارد کنید')) {
              isValid = false;
              errors.push('مرحله پروژه');
            }
            
            // اعتبارسنجی بر اساس نوع پیش‌فروش
            switch (selectedPresaleType.value) {
              case 'آپارتمان':
                if (!validatePropertyType('presale-apartment')) {
                  isValid = false;
                }
                break;
              case 'ویلا':
                if (!validatePropertyType('presale-villa')) {
                  isValid = false;
                }
                break;
            }
          }
          break;
      }
    }
    
    // نمایش خطاها
    if (!isValid) {
      const errorsList = document.getElementById('errorsList');
      errorsList.innerHTML = '';
      errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorsList.appendChild(li);
      });
      document.getElementById('validationErrors').classList.remove('hidden');
      
      // اسکرول به بالای فرم
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById('validationErrors').classList.add('hidden');
    }
    
    return isValid;
  }

  // اعتبارسنجی فیلدهای مختلف بر اساس نوع ملک
  function validatePropertyType(type) {
    let isValid = true;
    
    // فیلدهای مشترک
    if (!validateDocumentType()) {
      isValid = false;
    }
    
    // فیلدهای مخصوص هر نوع
    switch (type) {
      case 'apartment':
        if (!validateField('unitArea-apartment', 'متراژ واحد را وارد کنید')) isValid = false;
        if (!validateField('roomCount-apartment', 'تعداد اتاق‌ها را وارد کنید')) isValid = false;
        if (!validateField('buildYear-apartment', 'سال ساخت را وارد کنید')) isValid = false;
        if (!validateField('totalPrice-apartment', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('apartment')) isValid = false;
        if (!validateField('address-apartment', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'villa':
        if (!validateField('landArea-villa', 'متراژ زمین را وارد کنید')) isValid = false;
        if (!validateField('buildingArea-villa', 'متراژ بنا را وارد کنید')) isValid = false;
        if (!validateField('roomCount-villa', 'تعداد اتاق‌ها را وارد کنید')) isValid = false;
        if (!validateField('buildYear-villa', 'سال ساخت را وارد کنید')) isValid = false;
        if (!validateField('price-villa', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('villa')) isValid = false;
        if (!validateField('address-villa', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'land':
        if (!validateField('landArea-land', 'متراژ زمین را وارد کنید')) isValid = false;
        if (!validateField('landUsage', 'کاربری را وارد کنید')) isValid = false;
        if (!validateField('totalPrice-land', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('land')) isValid = false;
        if (!validateField('address-land', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'commercial':
        if (!validateField('shopArea', 'متراژ مغازه را وارد کنید')) isValid = false;
        if (!validateField('totalPrice-commercial', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('commercial')) isValid = false;
        if (!validateField('address-commercial', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'old':
        if (!validateField('landArea-old', 'متراژ زمین را وارد کنید')) isValid = false;
        if (!validateField('buildingArea-old', 'متراژ بنا را وارد کنید')) isValid = false;
        if (!validateField('totalPrice-old', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('old')) isValid = false;
        if (!validateField('address-old', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'presale-apartment':
        if (!validateField('unitArea-presale-apartment', 'متراژ واحد را وارد کنید')) isValid = false;
        if (!validateField('roomCount-presale-apartment', 'تعداد اتاق‌ها را وارد کنید')) isValid = false;
        if (!validateField('totalPrice-presale-apartment', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('presale-apartment')) isValid = false;
        if (!validateField('address-presale-apartment', 'آدرس را وارد کنید')) isValid = false;
        break;
        
      case 'presale-villa':
        if (!validateField('landArea-presale-villa', 'متراژ زمین را وارد کنید')) isValid = false;
        if (!validateField('buildingArea-presale-villa', 'متراژ بنا را وارد کنید')) isValid = false;
        if (!validateField('roomCount-presale-villa', 'تعداد اتاق‌ها را وارد کنید')) isValid = false;
        if (!validateField('floorCount-presale-villa', 'تعداد طبقات را وارد کنید')) isValid = false;
        if (!validateField('price-presale-villa', 'قیمت کلی را وارد کنید')) isValid = false;
        if (!validateSaleConditions('presale-villa')) isValid = false;
        if (!validateField('address-presale-villa', 'آدرس را وارد کنید')) isValid = false;
        break;
    }
    
    return isValid;
  }

  // اعتبارسنجی فیلد
  function validateField(id, errorMessage) {
    const field = document.getElementById(id);
    if (!field) return true; // اگر فیلد وجود نداشت، اعتبارسنجی را رد کن
    
    if (!field.value.trim()) {
      const errorElement = document.getElementById(`${id}Error`);
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
      }
      field.classList.add('error-field');
      return false;
    }
    return true;
  }

  // اعتبارسنجی شماره تلفن
  function validatePhone(id) {
    const phoneField = document.getElementById(id);
    const phoneRegex = /^09\d{9}$/;
    
    if (!phoneRegex.test(phoneField.value)) {
      const errorElement = document.getElementById(`${id}Error`);
      if (errorElement) {
        errorElement.textContent = 'شماره تلفن باید با ۰۹ شروع شده و ۱۱ رقم باشد';
        errorElement.classList.remove('hidden');
      }
      phoneField.classList.add('error-field');
      return false;
    }
    return true;
  }

  // اعتبارسنجی وضعیت سند
  function validateDocumentType() {
    const selectedType = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedType) return false;
    
    const documentChecked = document.querySelector('input[name="document"]:checked');
    if (!documentChecked) {
      let errorId;
      
      // تعیین ID المان خطا بر اساس نوع ملک
      switch (selectedType.value) {
        case 'آپارتمان':
          errorId = 'document-apartmentError';
          break;
        case 'ویلا':
          errorId = 'document-villaError';
          break;
        case 'زمین':
          errorId = 'document-landError';
          break;
        case 'تجاری / مغازه':
          errorId = 'document-commercialError';
          break;
        case 'کلنگی':
          errorId = 'document-oldError';
          break;
        case 'پیش‌فروش':
          const presaleType = document.querySelector('input[name="presaleType"]:checked');
          if (presaleType) {
            if (presaleType.value === 'آپارتمان') {
              errorId = 'document-presale-apartmentError';
            } else {
              errorId = 'document-presale-villaError';
            }
          }
          break;
      }
      
      if (errorId) {
        document.getElementById(errorId).classList.remove('hidden');
      }
      
      return false;
    }
    
    return true;
  }

  // اعتبارسنجی شرایط فروش
  function validateSaleConditions(type) {
    const saleConditionsChecked = document.querySelectorAll(`input[name="saleConditions"]:checked`);
    
    if (saleConditionsChecked.length === 0) {
      document.getElementById(`saleConditions-${type}Error`).classList.remove('hidden');
      return false;
    }
    
    return true;
  }

  // جمع‌آوری اطلاعات فرم
  function collectFormData() {
    const formData = {
      uniqueId: uniqueId,
      personal: {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        altPhone: document.getElementById('altPhone').value
      },
      propertyType: document.querySelector('input[name="propertyType"]:checked')?.value || ''
    };
    
    // اضافه کردن اطلاعات بر اساس نوع ملک
    if (formData.propertyType) {
      switch (formData.propertyType) {
        case 'آپارتمان':
          formData.details = collectPropertyDetails('apartment');
          break;
        case 'ویلا':
          formData.details = collectPropertyDetails('villa');
          break;
        case 'زمین':
          formData.details = collectPropertyDetails('land');
          break;
        case 'تجاری / مغازه':
          formData.details = collectPropertyDetails('commercial');
          break;
        case 'کلنگی':
          formData.details = collectPropertyDetails('old');
          break;
        case 'پیش‌فروش':
          formData.presaleType = document.querySelector('input[name="presaleType"]:checked')?.value || '';
          formData.projectProgress = document.getElementById('projectProgress').value;
          
          if (formData.presaleType === 'آپارتمان') {
            formData.details = collectPropertyDetails('presale-apartment');
          } else if (formData.presaleType === 'ویلا') {
            formData.details = collectPropertyDetails('presale-villa');
          }
          break;
      }
    }
    
    return formData;
  }

  // جمع‌آوری اطلاعات هر نوع ملک
  function collectPropertyDetails(type) {
    const details = {};
    
    // جمع‌آوری فیلدهای مختلف بر اساس نوع ملک
    switch (type) {
      case 'apartment':
        details.landArea = document.getElementById('landArea-apartment').value;
        details.unitArea = document.getElementById('unitArea-apartment').value;
        details.roomCount = document.getElementById('roomCount-apartment').value;
        details.buildYear = document.getElementById('buildYear-apartment').value;
        details.kitchen = collectCheckboxValues('kitchen-apartment');
        details.facilities = collectCheckboxValues('facilities-apartment');
        details.otherFacilities = document.getElementById('otherFacilities-apartment').value;
        details.amenities = collectCheckboxValues('amenities-apartment');
        details.otherAmenities = document.getElementById('otherAmenities-apartment').value;
        details.commonAreas = collectCheckboxValues('commonAreas-apartment');
        details.otherCommonAreas = document.getElementById('otherCommonAreas-apartment').value;
        details.otherDetails = document.getElementById('otherDetails-apartment').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.pricePerMeter = document.getElementById('pricePerMeter-apartment').value;
        details.totalPrice = document.getElementById('totalPrice-apartment').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-apartment').value;
        details.address = document.getElementById('address-apartment').value;
        break;
        
      case 'villa':
        details.landArea = document.getElementById('landArea-villa').value;
        details.buildingArea = document.getElementById('buildingArea-villa').value;
        details.roomCount = document.getElementById('roomCount-villa').value;
        details.buildYear = document.getElementById('buildYear-villa').value;
        details.kitchen = collectCheckboxValues('kitchen-villa');
        details.facilities = collectCheckboxValues('facilities-villa');
        details.otherFacilities = document.getElementById('otherFacilities-villa').value;
        details.amenities = collectCheckboxValues('amenities-villa');
        details.otherAmenities = document.getElementById('otherAmenities-villa').value;
        details.otherDetails = document.getElementById('otherDetails-villa').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.price = document.getElementById('price-villa').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-villa').value;
        details.address = document.getElementById('address-villa').value;
        break;
        
      case 'land':
        details.landArea = document.getElementById('landArea-land').value;
        details.landUsage = document.getElementById('landUsage').value;
        details.landWidth = document.getElementById('landWidth').value;
        details.landDepth = document.getElementById('landDepth').value;
        details.alleyWidth = document.getElementById('alleyWidth').value;
        details.enclosed = document.querySelector('input[name="enclosed"]:checked')?.value || '';
        details.otherDetails = document.getElementById('otherDetails-land').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.pricePerMeter = document.getElementById('pricePerMeter-land').value;
        details.totalPrice = document.getElementById('totalPrice-land').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-land').value;
        details.address = document.getElementById('address-land').value;
        break;
        
      case 'commercial':
        details.shopArea = document.getElementById('shopArea').value;
        details.shopHeight = document.getElementById('shopHeight').value;
        details.shopWidth = document.getElementById('shopWidth').value;
        details.shopDetails = document.getElementById('shopDetails').value;
        details.otherDetails = document.getElementById('otherDetails-commercial').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.pricePerMeter = document.getElementById('pricePerMeter-commercial').value;
        details.totalPrice = document.getElementById('totalPrice-commercial').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-commercial').value;
        details.address = document.getElementById('address-commercial').value;
        break;
        
      case 'old':
        details.landArea = document.getElementById('landArea-old').value;
        details.buildingArea = document.getElementById('buildingArea-old').value;
        details.landWidth = document.getElementById('landWidth-old').value;
        details.landDepth = document.getElementById('landDepth-old').value;
        details.livability = document.querySelector('input[name="livability"]:checked')?.value || '';
        details.utilities = collectCheckboxValues('utilities');
        details.amenities = document.getElementById('amenities-old').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.pricePerMeter = document.getElementById('pricePerMeter-old').value;
        details.totalPrice = document.getElementById('totalPrice-old').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-old').value;
        details.address = document.getElementById('address-old').value;
        break;
        
      case 'presale-apartment':
        details.landArea = document.getElementById('landArea-presale-apartment').value;
        details.unitArea = document.getElementById('unitArea-presale-apartment').value;
        details.roomCount = document.getElementById('roomCount-presale-apartment').value;
        details.floorCount = document.getElementById('floorCount-presale-apartment').value;
        details.floorNumber = document.getElementById('floorNumber-presale-apartment').value;
        details.unitsPerFloor = document.getElementById('unitsPerFloor-presale-apartment').value;
        details.moreDetails = document.getElementById('moreDetails-presale-apartment').value;
        details.kitchen = collectCheckboxValues('kitchen-presale-apartment');
        details.otherDetails = document.getElementById('otherDetails-presale-apartment').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.pricePerMeter = document.getElementById('pricePerMeter-presale-apartment').value;
        details.totalPrice = document.getElementById('totalPrice-presale-apartment').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-presale-apartment').value;
        details.address = document.getElementById('address-presale-apartment').value;
        break;
        
      case 'presale-villa':
        details.landArea = document.getElementById('landArea-presale-villa').value;
        details.buildingArea = document.getElementById('buildingArea-presale-villa').value;
        details.roomCount = document.getElementById('roomCount-presale-villa').value;
        details.floorCount = document.getElementById('floorCount-presale-villa').value;
        details.kitchen = collectCheckboxValues('kitchen-presale-villa');
        details.otherDetails = document.getElementById('otherDetails-presale-villa').value;
        details.document = document.querySelector('input[name="document"]:checked')?.value || '';
        details.price = document.getElementById('price-presale-villa').value;
        details.saleConditions = collectCheckboxValues('saleConditions');
        details.saleConditionDetails = document.getElementById('saleConditionDetails-presale-villa').value;
        details.address = document.getElementById('address-presale-villa').value;
        break;
    }
    
    return details;
  }

  // جمع‌آوری مقادیر چک باکس‌ها
  function collectCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
  }

  // ارسال ایمیل با استفاده از EmailJS
  async function sendEmail(formData) {
    // تبدیل اطلاعات فرم به متن برای ارسال در ایمیل
    const emailText = formatFormDataForEmail(formData);
    
    const templateParams = {
      to_email: 'amlak.moein.form@gmail.com', // ایمیل دریافت کننده اصلاح شده
      subject: `ثبت ملک جدید - ${formData.uniqueId}`,
      message: emailText,
      from_name: `${formData.personal.firstName} ${formData.personal.lastName}`,
      reply_to: 'no-reply@example.com'
    };

    return emailjs.send('service_rds9l25', 'template_5do0c0n', templateParams); // شناسه سرویس و قالب اصلاح شده
  }

  // فرمت کردن اطلاعات فرم برای ایمیل
  function formatFormDataForEmail(formData) {
    let emailText = `شناسه ملک: ${formData.uniqueId}\n\n`;
    emailText += `اطلاعات شخصی:\n`;
    emailText += `نام و نام خانوادگی: ${formData.personal.firstName} ${formData.personal.lastName}\n`;
    emailText += `شماره تماس: ${formData.personal.phone}\n`;
    
    if (formData.personal.altPhone) {
      emailText += `شماره تماس دیگر: ${formData.personal.altPhone}\n`;
    }
    
    emailText += `\nنوع ملک: ${formData.propertyType}\n`;
    
    if (formData.propertyType === 'پیش‌فروش') {
      emailText += `نوع پیش‌فروش: ${formData.presaleType}\n`;
      emailText += `مرحله پروژه: ${formData.projectProgress}\n\n`;
    }
    
    emailText += `\nجزئیات ملک:\n`;
    
    // اضافه کردن جزئیات مختلف بر اساس نوع ملک
    const details = formData.details;
    if (details) {
      Object.keys(details).forEach(key => {
        if (details[key] && details[key].length > 0) {
          if (Array.isArray(details[key])) {
            emailText += `${translatePropertyKey(key)}: ${details[key].join(', ')}\n`;
          } else {
            emailText += `${translatePropertyKey(key)}: ${details[key]}\n`;
          }
        }
      });
    }
    
    return emailText;
  }

  // ترجمه کلیدهای انگلیسی به فارسی برای نمایش در ایمیل
  function translatePropertyKey(key) {
    const translations = {
      'landArea': 'متراژ زمین',
      'unitArea': 'متراژ واحد',
      'buildingArea': 'متراژ بنا',
      'roomCount': 'تعداد اتاق‌ها',
      'buildYear': 'سال ساخت',
      'kitchen': 'آشپزخانه',
      'facilities': 'تاسیسات',
      'otherFacilities': 'سایر تاسیسات',
      'amenities': 'امکانات',
      'otherAmenities': 'سایر امکانات',
      'commonAreas': 'مشاعات',
      'otherCommonAreas': 'سایر مشاعات',
      'otherDetails': 'سایر توضیحات',
      'document': 'وضعیت سند',
      'pricePerMeter': 'قیمت متری',
      'totalPrice': 'قیمت کلی',
      'price': 'قیمت',
      'saleConditions': 'شرایط فروش',
      'saleConditionDetails': 'جزئیات شرایط فروش',
      'address': 'آدرس',
      'landUsage': 'کاربری زمین',
      'landWidth': 'بر زمین',
      'landDepth': 'عمق زمین',
      'alleyWidth': 'عرض کوچه',
      'enclosed': 'محصور',
      'shopArea': 'متراژ مغازه',
      'shopHeight': 'ارتفاع مغازه',
      'shopWidth': 'دهنه مغازه',
      'shopDetails': 'توضیحات شکل مغازه',
      'livability': 'وضعیت سکونت',
      'utilities': 'امتیازات',
      'floorCount': 'تعداد طبقات',
      'floorNumber': 'طبقه',
      'unitsPerFloor': 'واحد در هر طبقه',
      'moreDetails': 'توضیحات بیشتر'
    };
    
    return translations[key] || key;
  }

  // تولید شناسه منحصر به فرد
  function generateUniqueId() {
    const timestamp = new Date().getTime().toString().slice(-5);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ME-${timestamp}${random}`;
  }

  // نمایش منوی همبرگری
  function showMenuOverlay() {
    document.getElementById('menuOverlay').style.display = 'flex';
  }

  // مخفی کردن منوی همبرگری
  function hideMenuOverlay() {
    document.getElementById('menuOverlay').style.display = 'none';
  }

  // نمایش پیام تأیید
  function showConfirmOverlay() {
    document.getElementById('confirmOverlay').style.display = 'flex';
  }

  // مخفی کردن پیام تأیید
  function hideConfirmOverlay() {
    document.getElementById('confirmOverlay').style.display = 'none';
  }

  // نمایش پیام در حال ارسال
  function showSendingOverlay() {
    document.getElementById('sendingOverlay').style.display = 'flex';
  }

  // نمایش پیام موفقیت
  function showSuccessOverlay() {
    document.getElementById('uniqueIdDisplay').textContent = uniqueId;
    document.getElementById('successOverlay').style.display = 'flex';
  }

  // مخفی کردن پیام موفقیت
  function hideSuccessOverlay() {
    document.getElementById('successOverlay').style.display = 'none';
  }

  // نمایش پیام خطا
  function showErrorOverlay() {
    document.getElementById('errorOverlay').style.display = 'flex';
  }

  // مخفی کردن پیام خطا
  function hideErrorOverlay() {
    document.getElementById('errorOverlay').style.display = 'none';
  }

  // مخفی کردن همه پیام‌ها
  function hideOverlay(id) {
    document.getElementById(id).style.display = 'none';
  }

  // پخش صدا
  function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Error playing sound:', e));
    }
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
    
    // مخفی کردن پیام خطاهای اعتبارسنجی
    document.getElementById('validationErrors').classList.add('hidden');
    
    // مخفی کردن پیام تأیید
    hideConfirmOverlay();
    
    // تولید شناسه جدید
    uniqueId = generateUniqueId();
    
    // اسکرول به بالای فرم
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});