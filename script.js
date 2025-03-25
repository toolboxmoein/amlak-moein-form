document.addEventListener('DOMContentLoaded', function() {
  // مقداردهی اولیه EmailJS
  (function() {
    // کلید عمومی EmailJS شما را اینجا قرار دهید
    emailjs.init("7zOCMQKl0bRjmv6cn");
  })();
  
  // متغیرهای فرم
  const form = document.getElementById('propertyForm');
  const successOverlay = document.getElementById('successOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const resetBtn = document.getElementById('resetBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  const sendingOverlay = document.getElementById('sendingOverlay');
  
  // متغیرهای منوی همبرگری
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  
  // متغیرهای آپلود عکس
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  let selectedImages = [];
  
  // متغیرهای انتخاب نوع ملک
  const propertyTypeRadios = document.getElementsByName('propertyType');
  const apartmentDetails = document.getElementById('apartmentDetails');
  const villaDetails = document.getElementById('villaDetails');
  const landDetails = document.getElementById('landDetails');
  const commercialDetails = document.getElementById('commercialDetails');
  const oldDetails = document.getElementById('oldDetails');
  const presaleTypeSection = document.getElementById('presaleTypeSection');
  const presaleApartmentDetails = document.getElementById('presaleApartmentDetails');
  const presaleVillaDetails = document.getElementById('presaleVillaDetails');
  const commonDetails = document.getElementById('commonDetails');
  const imageUploadSection = document.getElementById('imageUploadSection');
  
  // رویداد برای منوی همبرگری
  hamburgerMenu.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });
  
  menuClose.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });
  
  // رویداد برای بستن پیام موفقیت
  closeSuccessBtn.addEventListener('click', function() {
    successOverlay.style.display = 'none';
  });
  
  // رویداد برای دکمه پاک کردن
  resetBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'flex';
  });
  
  // رویدادهای دیالوگ تأیید
  confirmYesBtn.addEventListener('click', function() {
    form.reset();
    imagePreview.innerHTML = '';
    selectedImages = [];
    hideAllDetails();
    confirmOverlay.style.display = 'none';
  });
  
  confirmNoBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'none';
  });
  
  // رویداد برای تغییر نوع ملک
  for (const radio of propertyTypeRadios) {
    radio.addEventListener('change', function() {
      hideAllDetails();
      
      if (this.value === 'آپارتمان') {
        apartmentDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.add('hidden');
      } else if (this.value === 'ویلا') {
        villaDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.add('hidden');
      } else if (this.value === 'زمین') {
        landDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.add('hidden');
      } else if (this.value === 'تجاری') {
        commercialDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.add('hidden');
      } else if (this.value === 'کلنگی') {
        oldDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.add('hidden');
      } else if (this.value === 'پیش‌فروش') {
        presaleTypeSection.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.add('hidden');
      }
    });
  }
  
  // رویداد برای تغییر نوع پیش‌فروش
  const presaleTypeRadios = document.getElementsByName('presaleType');
  for (const radio of presaleTypeRadios) {
    radio.addEventListener('change', function() {
      presaleApartmentDetails.classList.add('hidden');
      presaleVillaDetails.classList.add('hidden');
      
      if (this.value === 'آپارتمان') {
        presaleApartmentDetails.classList.remove('hidden');
      } else if (this.value === 'ویلا') {
        presaleVillaDetails.classList.remove('hidden');
      }
    });
  }
  
  // رویداد برای آپلود عکس
  imageUpload.addEventListener('change', handleImageUpload);
  
  // رویداد برای drag and drop عکس
  const uploadBtnWrapper = document.querySelector('.upload-btn-wrapper');
  
  uploadBtnWrapper.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#007BFF';
    this.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
  });
  
  uploadBtnWrapper.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.borderColor = '#ccc';
    this.style.backgroundColor = 'white';
  });
  
  uploadBtnWrapper.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#ccc';
    this.style.backgroundColor = 'white';
    
    if (e.dataTransfer.files.length > 0) {
      imageUpload.files = e.dataTransfer.files;
      handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
  });
  
  // رویداد برای ارسال فرم
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("فرم ارسال شد");
    
    // اعتبارسنجی فرم
    if (!validateForm()) {
      console.log("اعتبارسنجی فرم ناموفق بود");
      return;
    }
    
    // نمایش وضعیت ارسال
    sendingOverlay.style.display = 'flex';
    
    // جمع‌آوری داده‌ها
    const formData = collectFormData();
    console.log("داده‌های فرم جمع‌آوری شد:", formData);
    
    // تبدیل عکس‌ها به Base64 و ارسال فرم
    prepareAndSendForm(formData);
  });
  
  // تابع مخفی کردن تمام بخش‌های جزئیات
  function hideAllDetails() {
    apartmentDetails.classList.add('hidden');
    villaDetails.classList.add('hidden');
    landDetails.classList.add('hidden');
    commercialDetails.classList.add('hidden');
    oldDetails.classList.add('hidden');
    presaleTypeSection.classList.add('hidden');
    presaleApartmentDetails.classList.add('hidden');
    presaleVillaDetails.classList.add('hidden');
    commonDetails.classList.add('hidden');
    imageUploadSection.classList.add('hidden');
    document.getElementById('priceSection-meter').classList.add('hidden');
    document.getElementById('priceSection-normal').classList.add('hidden');
    
    // پاک کردن خطاها
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
      element.classList.add('hidden');
    });
    
    // پاک کردن کلاس error-field از تمام فیلدها
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
      field.classList.remove('error-field');
    });
  }
  
  // تابع اعتبارسنجی فرم
  function validateForm() {
    let isValid = true;
    
    // اعتبارسنجی نام و نام خانوادگی (فقط فارسی)
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    
    const persianRegex = /^[\u0600-\u06FF\s]+$/;
    
    if (!persianRegex.test(firstName.value)) {
      firstName.classList.add('error-field');
      firstNameError.classList.remove('hidden');
      isValid = false;
    } else {
      firstName.classList.remove('error-field');
      firstNameError.classList.add('hidden');
    }
    
    if (!persianRegex.test(lastName.value)) {
      lastName.classList.add('error-field');
      lastNameError.classList.remove('hidden');
      isValid = false;
    } else {
      lastName.classList.remove('error-field');
      lastNameError.classList.add('hidden');
    }
    
    // اعتبارسنجی شماره تماس
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    
    if (phone.value.length !== 11 || isNaN(phone.value)) {
      phone.classList.add('error-field');
      phoneError.classList.remove('hidden');
      isValid = false;
    } else {
      phone.classList.remove('error-field');
      phoneError.classList.add('hidden');
    }
    
    // اعتبارسنجی شماره تماس دیگر (اگر وارد شده باشد)
    const altPhone = document.getElementById('altPhone');
    const altPhoneError = document.getElementById('altPhoneError');
    
    if (altPhone.value && (isNaN(altPhone.value) || altPhone.value.length < 10)) {
      altPhone.classList.add('error-field');
      altPhoneError.classList.remove('hidden');
      isValid = false;
    } else {
      altPhone.classList.remove('error-field');
      altPhoneError.classList.add('hidden');
    }
    
    // اعتبارسنجی نوع ملک
    const propertyType = document.querySelector('input[name="propertyType"]:checked');
    const typeError = document.getElementById('typeError');
    
    if (!propertyType) {
      typeError.classList.remove('hidden');
      isValid = false;
    } else {
      typeError.classList.add('hidden');
      
      // اعتبارسنجی فیلدهای مختلف بر اساس نوع ملک
      if (propertyType.value === 'آپارتمان') {
        isValid = validateApartmentFields() && isValid;
      } else if (propertyType.value === 'ویلا') {
        isValid = validateVillaFields() && isValid;
      } else if (propertyType.value === 'زمین') {
        isValid = validateLandFields() && isValid;
      } else if (propertyType.value === 'تجاری') {
        isValid = validateCommercialFields() && isValid;
      } else if (propertyType.value === 'کلنگی') {
        isValid = validateOldFields() && isValid;
      } else if (propertyType.value === 'پیش‌فروش') {
        const presaleType = document.querySelector('input[name="presaleType"]:checked');
        if (!presaleType) {
          isValid = false;
        } else if (presaleType.value === 'آپارتمان') {
          isValid = validatePresaleApartmentFields() && isValid;
        } else if (presaleType.value === 'ویلا') {
          isValid = validatePresaleVillaFields() && isValid;
        }
        
        // اعتبارسنجی فیلد پیشرفت پروژه
        const projectProgress = document.getElementById('projectProgress');
        if (!projectProgress.value.trim()) {
          projectProgress.classList.add('error-field');
          isValid = false;
        } else {
          projectProgress.classList.remove('error-field');
        }
      }
    }
    
    // اعتبارسنجی وضعیت سند
    const documentChecked = document.querySelector('input[name="document"]:checked');
    const documentError = document.getElementById('documentError');
    
    if (!documentChecked) {
      documentError.classList.remove('hidden');
      isValid = false;
    } else {
      documentError.classList.add('hidden');
    }
    
    // اعتبارسنجی قیمت
    const pricePerMeter = document.getElementById('pricePerMeter');
    const totalPrice = document.getElementById('totalPrice');
    const price = document.getElementById('price');
    
    if (propertyType && (propertyType.value === 'آپارتمان' || propertyType.value === 'زمین' || propertyType.value === 'تجاری')) {
      if (!totalPrice.value.trim()) {
        totalPrice.classList.add('error-field');
        isValid = false;
      } else {
        totalPrice.classList.remove('error-field');
      }
    } else if (propertyType) {
      if (!price.value.trim()) {
        price.classList.add('error-field');
        isValid = false;
      } else {
        price.classList.remove('error-field');
      }
    }
    
    // اعتبارسنجی شرایط فروش
    const saleConditionChecked = document.querySelector('input[name="saleConditions"]:checked');
    const saleConditionError = document.getElementById('saleConditionError');
    
    if (!saleConditionChecked) {
      saleConditionError.classList.remove('hidden');
      isValid = false;
    } else {
      saleConditionError.classList.add('hidden');
    }
    
    // اعتبارسنجی آدرس
    const address = document.getElementById('address');
    
    if (!address.value.trim()) {
      address.classList.add('error-field');
      isValid = false;
    } else {
      address.classList.remove('error-field');
    }
    
    return isValid;
  }
  
  // توابع اعتبارسنجی برای هر نوع ملک
  function validateApartmentFields() {
    let isValid = true;
    
    // فیلدهای اجباری آپارتمان
    const requiredFields = [
      'landArea-apartment',
      'unitArea-apartment',
      'roomCount-apartment',
      'buildYear-apartment'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validateVillaFields() {
    let isValid = true;
    
    // فیلدهای اجباری ویلا
    const requiredFields = [
      'landArea-villa',
      'buildingArea-villa',
      'roomCount-villa',
      'buildYear-villa'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validateLandFields() {
    let isValid = true;
    
    // فیلدهای اجباری زمین
    const requiredFields = [
      'landArea-land',
      'landUsage'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validateCommercialFields() {
    let isValid = true;
    
    // فیلدهای اجباری تجاری
    const requiredFields = [
      'shopArea'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validateOldFields() {
    let isValid = true;
    
    // فیلدهای اجباری کلنگی
    const requiredFields = [
      'landArea-old',
      'buildingArea-old'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validatePresaleApartmentFields() {
    let isValid = true;
    
    // فیلدهای اجباری پیش‌فروش آپارتمان
    const requiredFields = [
      'landArea-presale-apartment',
      'unitArea-presale-apartment',
      'roomCount-presale-apartment'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  function validatePresaleVillaFields() {
    let isValid = true;
    
    // فیلدهای اجباری پیش‌فروش ویلا
    const requiredFields = [
      'landArea-presale-villa',
      'buildingArea-presale-villa',
      'roomCount-presale-villa',
      'floorCount-presale-villa'
    ];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error-field');
        isValid = false;
      } else {
        field.classList.remove('error-field');
      }
    });
    
    return isValid;
  }
  
  // تابع جمع‌آوری داده‌های فرم
  function collectFormData() {
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      phone: document.getElementById('phone').value,
      altPhone: document.getElementById('altPhone').value || '',
      propertyType: document.querySelector('input[name="propertyType"]:checked')?.value || '',
      documentType: getSelectedValues('document'),
      otherDocument: document.getElementById('otherDocument').value || '',
      saleConditions: getSelectedValues('saleConditions'),
      saleConditionDetails: document.getElementById('saleConditionDetails').value || '',
      address: document.getElementById('address').value
    };
    
    // اضافه کردن اطلاعات قیمت
    if (formData.propertyType === 'آپارتمان' || formData.propertyType === 'زمین' || formData.propertyType === 'تجاری') {
      formData.pricePerMeter = document.getElementById('pricePerMeter').value || '';
      formData.totalPrice = document.getElementById('totalPrice').value || '';
    } else {
      formData.price = document.getElementById('price').value || '';
    }
    
    // اضافه کردن اطلاعات مختص هر نوع ملک
    if (formData.propertyType === 'آپارتمان') {
      formData.apartmentDetails = collectApartmentData();
    } else if (formData.propertyType === 'ویلا') {
      formData.villaDetails = collectVillaData();
    } else if (formData.propertyType === 'زمین') {
      formData.landDetails = collectLandData();
    } else if (formData.propertyType === 'تجاری') {
      formData.commercialDetails = collectCommercialData();
    } else if (formData.propertyType === 'کلنگی') {
      formData.oldDetails = collectOldData();
    } else if (formData.propertyType === 'پیش‌فروش') {
      formData.presaleType = document.querySelector('input[name="presaleType"]:checked')?.value || '';
      formData.projectProgress = document.getElementById('projectProgress').value || '';
      
      if (formData.presaleType === 'آپارتمان') {
        formData.presaleApartmentDetails = collectPresaleApartmentData();
      } else if (formData.presaleType === 'ویلا') {
        formData.presaleVillaDetails = collectPresaleVillaData();
      }
    }
    
    return formData;
  }
  
  // توابع جمع‌آوری داده‌ها برای هر نوع ملک
  function collectApartmentData() {
    return {
      location: document.querySelector('input[name="location-apartment"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-apartment').value || '',
      landArea: document.getElementById('landArea-apartment').value || '',
      unitArea: document.getElementById('unitArea-apartment').value || '',
      roomCount: document.getElementById('roomCount-apartment').value || '',
      buildYear: document.getElementById('buildYear-apartment').value || '',
      kitchen: getSelectedValues('kitchen-apartment'),
      otherKitchen: document.getElementById('otherKitchen-apartment').value || '',
      facilities: getSelectedValues('facilities-apartment'),
      otherFacilities: document.getElementById('otherFacilities-apartment').value || '',
      amenities: getSelectedValues('amenities-apartment'),
      otherAmenities: document.getElementById('otherAmenities-apartment').value || '',
      commonAreas: getSelectedValues('commonAreas-apartment'),
      otherCommonAreas: document.getElementById('otherCommonAreas-apartment').value || '',
      otherDetails: document.getElementById('otherDetails-apartment').value || ''
    };
  }
  
  function collectVillaData() {
    return {
      location: document.querySelector('input[name="location-villa"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-villa').value || '',
      landArea: document.getElementById('landArea-villa').value || '',
      buildingArea: document.getElementById('buildingArea-villa').value || '',
      roomCount: document.getElementById('roomCount-villa').value || '',
      buildYear: document.getElementById('buildYear-villa').value || '',
      kitchen: getSelectedValues('kitchen-villa'),
      otherKitchen: document.getElementById('otherKitchen-villa').value || '',
      facilities: getSelectedValues('facilities-villa'),
      otherFacilities: document.getElementById('otherFacilities-villa').value || '',
      amenities: getSelectedValues('amenities-villa'),
      otherAmenities: document.getElementById('otherAmenities-villa').value || '',
      otherDetails: document.getElementById('otherDetails-villa').value || ''
    };
  }
  
  function collectLandData() {
    return {
      location: document.querySelector('input[name="location-land"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-land').value || '',
      landArea: document.getElementById('landArea-land').value || '',
      landUsage: document.getElementById('landUsage').value || '',
      landWidth: document.getElementById('landWidth').value || '',
      landDepth: document.getElementById('landDepth').value || '',
      alleyWidth: document.getElementById('alleyWidth').value || '',
      enclosed: document.querySelector('input[name="enclosed"]:checked')?.value || '',
      position: document.querySelector('input[name="position"]:checked')?.value || '',
      otherDetails: document.getElementById('otherDetails-land').value || ''
    };
  }
  
  function collectCommercialData() {
    return {
      shopArea: document.getElementById('shopArea').value || '',
      shopHeight: document.getElementById('shopHeight').value || '',
      shopWidth: document.getElementById('shopWidth').value || '',
      shopDetails: document.getElementById('shopDetails').value || '',
      otherDetails: document.getElementById('otherDetails-commercial').value || ''
    };
  }
  
  function collectOldData() {
    return {
      location: document.querySelector('input[name="location-old"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-old').value || '',
      landArea: document.getElementById('landArea-old').value || '',
      buildingArea: document.getElementById('buildingArea-old').value || '',
      livability: document.querySelector('input[name="livability"]:checked')?.value || '',
      landWidth: document.getElementById('landWidth-old').value || '',
      landDepth: document.getElementById('landDepth-old').value || '',
      utilities: getSelectedValues('utilities'),
      amenities: document.getElementById('amenities-old').value || ''
    };
  }
  
  function collectPresaleApartmentData() {
    return {
      location: document.querySelector('input[name="location-presale-apartment"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-presale-apartment').value || '',
      landArea: document.getElementById('landArea-presale-apartment').value || '',
      unitArea: document.getElementById('unitArea-presale-apartment').value || '',
      roomCount: document.getElementById('roomCount-presale-apartment').value || '',
      floorCount: document.getElementById('floorCount-presale-apartment').value || '',
      floorNumber: document.getElementById('floorNumber-presale-apartment').value || '',
      unitsPerFloor: document.getElementById('unitsPerFloor-presale-apartment').value || '',
      moreDetails: document.getElementById('moreDetails-presale-apartment').value || '',
      kitchen: getSelectedValues('kitchen-presale-apartment'),
      otherKitchen: document.getElementById('otherKitchen-presale-apartment').value || '',
      otherDetails: document.getElementById('otherDetails-presale-apartment').value || ''
    };
  }
  
  function collectPresaleVillaData() {
    return {
      location: document.querySelector('input[name="location-presale-villa"]:checked')?.value || '',
      otherLocation: document.getElementById('otherLocation-presale-villa').value || '',
      landArea: document.getElementById('landArea-presale-villa').value || '',
      buildingArea: document.getElementById('buildingArea-presale-villa').value || '',
      roomCount: document.getElementById('roomCount-presale-villa').value || '',
      floorCount: document.getElementById('floorCount-presale-villa').value || '',
      otherDetails: document.getElementById('otherDetails-presale-villa').value || ''
    };
  }
  
  // تابع دریافت مقادیر انتخاب شده از چک‌باکس‌ها
  function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(checkbox => checkbox.value);
  }
  
  // تابع مدیریت آپلود عکس
  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    // محدود کردن تعداد عکس‌ها به 10 عدد
    if (selectedImages.length + files.length > 10) {
      alert('شما می‌توانید حداکثر 10 عکس آپلود کنید.');
      return;
    }
    
    files.forEach(file => {
      // بررسی نوع فایل
      if (!file.type.startsWith('image/')) {
        alert(`فایل ${file.name} یک عکس نیست!`);
        return;
      }
      
      // بررسی حجم فایل (حداکثر 5 مگابایت)
      if (file.size > 5 * 1024 * 1024) {
        alert(`عکس ${file.name} بیش از 5 مگابایت است!`);
        return;
      }
      
      // افزودن عکس به لیست
      selectedImages.push(file);
      
      // نمایش پیش‌نمایش عکس
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.margin = '5px';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        imgContainer.appendChild(img);
        
        // دکمه حذف عکس
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '0';
        removeBtn.style.right = '0';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontSize = '16px';
        removeBtn.style.lineHeight = '1';
        removeBtn.style.padding = '0';
        
        removeBtn.addEventListener('click', function() {
          const index = selectedImages.indexOf(file);
          if (index > -1) {
            selectedImages.splice(index, 1);
          }
          imgContainer.remove();
        });
        
        imgContainer.appendChild(removeBtn);
        imagePreview.appendChild(imgContainer);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // تابع آماده‌سازی و ارسال فرم
  function prepareAndSendForm(formData) {
    // اگر عکسی انتخاب نشده باشد، مستقیماً فرم را ارسال می‌کنیم
    if (selectedImages.length === 0) {
      sendFormToEmail(formData, []);
      return;
    }
    
    // تبدیل عکس‌ها به Base64
    const imagePromises = selectedImages.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: e.target.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(imagePromises)
      .then(images => {
        sendFormToEmail(formData, images);
      })
      .catch(error => {
        console.error('خطا در تبدیل عکس‌ها:', error);
        sendingOverlay.style.display = 'none';
        alert('خطا در آماده‌سازی عکس‌ها. لطفاً دوباره تلاش کنید.');
      });
  }
  
  // تابع ارسال فرم به ایمیل با استفاده از EmailJS
  function sendFormToEmail(formData, images) {
    // ایجاد متن پیام
    const messageText = createEmailMessage(formData);
    
    // ایجاد پارامترهای ارسال به EmailJS
    const templateParams = {
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      property_type: formData.propertyType,
      message: messageText,
      // اضافه کردن تصاویر (حداکثر 3 تصویر به دلیل محدودیت EmailJS)
      image_count: images.length,
      images_note: images.length > 3 ? `تعداد کل تصاویر: ${images.length} (فقط 3 تصویر اول نمایش داده می‌شود)` : ''
    };
    
    // اضافه کردن اطلاعات مختص هر نوع ملک
    if (formData.propertyType === 'آپارتمان') {
      templateParams.apartmentDetails = formatApartmentDetails(formData.apartmentDetails);
    } else if (formData.propertyType === 'ویلا') {
      templateParams.villaDetails = formatVillaDetails(formData.villaDetails);
    } else if (formData.propertyType === 'زمین') {
      templateParams.landDetails = formatLandDetails(formData.landDetails);
    } else if (formData.propertyType === 'تجاری') {
      templateParams.commercialDetails = formatCommercialDetails(formData.commercialDetails);
    } else if (formData.propertyType === 'کلنگی') {
      templateParams.oldDetails = formatOldDetails(formData.oldDetails);
    } else if (formData.propertyType === 'پیش‌فروش') {
      templateParams.presaleType = formData.presaleType;
      templateParams.projectProgress = formData.projectProgress;
      
      if (formData.presaleType === 'آپارتمان') {
        templateParams.presaleApartmentDetails = formatPresaleApartmentDetails(formData.presaleApartmentDetails);
      } else if (formData.presaleType === 'ویلا') {
        templateParams.presaleVillaDetails = formatPresaleVillaDetails(formData.presaleVillaDetails);
      }
    }
    
    // اضافه کردن اطلاعات مشترک
    templateParams.documentType = formData.documentType.join(', ');
    templateParams.otherDocument = formData.otherDocument;
    templateParams.saleConditions = formData.saleConditions.join(', ');
    templateParams.saleConditionDetails = formData.saleConditionDetails;
    templateParams.address = formData.address;
    templateParams.altPhone = formData.altPhone;
    
    // اضافه کردن اطلاعات قیمت
    if (formData.propertyType === 'آپارتمان' || formData.propertyType === 'زمین' || formData.propertyType === 'تجاری') {
      templateParams.pricePerMeter = formData.pricePerMeter;
      templateParams.totalPrice = formData.totalPrice;
    } else {
      templateParams.price = formData.price;
    }
    
    // اضافه کردن تصاویر (حداکثر 3 تصویر)
    for (let i = 0; i < Math.min(images.length, 3); i++) {
      templateParams[`image_${i+1}`] = images[i].base64;
    }
    
    // ارسال به EmailJS
    emailjs.send(
      "service_rds9l25", // شناسه سرویس شما در EmailJS
      "template_5do0c0n", // شناسه قالب شما در EmailJS
      templateParams
    )
    .then(function(response) {
      console.log("SUCCESS", response);
      sendingOverlay.style.display = 'none';
      successOverlay.style.display = 'flex';
      
      // پاک کردن فرم
      form.reset();
      imagePreview.innerHTML = '';
      selectedImages = [];
      hideAllDetails();
    }, function(error) {
      console.log("FAILED", error);
      sendingOverlay.style.display = 'none';
      alert('متأسفانه ارسال اطلاعات با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.');
    });
  }
  
  // تابع ایجاد متن پیام ایمیل
  function createEmailMessage(formData) {
    let message = '';
    
    // اطلاعات شخصی
    message += `نام و نام خانوادگی: ${formData.firstName} ${formData.lastName}\n`;
    message += `شماره تماس: ${formData.phone}\n`;
    
    if (formData.altPhone) {
      message += `شماره تماس دیگر: ${formData.altPhone}\n`;
    }
    
    message += `نوع ملک: ${formData.propertyType}\n\n`;
    
    // اطلاعات مختص هر نوع ملک
    if (formData.propertyType === 'آپارتمان') {
      message += formatApartmentDetails(formData.apartmentDetails);
    } else if (formData.propertyType === 'ویلا') {
      message += formatVillaDetails(formData.villaDetails);
    } else if (formData.propertyType === 'زمین') {
      message += formatLandDetails(formData.landDetails);
    } else if (formData.propertyType === 'تجاری') {
      message += formatCommercialDetails(formData.commercialDetails);
    } else if (formData.propertyType === 'کلنگی') {
      message += formatOldDetails(formData.oldDetails);
    } else if (formData.propertyType === 'پیش‌فروش') {
      message += `نوع پیش‌فروش: ${formData.presaleType}\n`;
      message += `پروژه در چه مرحله‌ای است: ${formData.projectProgress}\n\n`;
      
      if (formData.presaleType === 'آپارتمان') {
        message += formatPresaleApartmentDetails(formData.presaleApartmentDetails);
      } else if (formData.presaleType === 'ویلا') {
        message += formatPresaleVillaDetails(formData.presaleVillaDetails);
      }
    }
    
    // اطلاعات مشترک
    message += `\n----- اطلاعات مشترک -----\n`;
    message += `وضعیت سند: ${formData.documentType.join(', ')}\n`;
    
    if (formData.otherDocument) {
      message += `سایر موارد سند: ${formData.otherDocument}\n`;
    }
    
    // اطلاعات قیمت
    if (formData.propertyType === 'آپارتمان' || formData.propertyType === 'زمین' || formData.propertyType === 'تجاری') {
      if (formData.pricePerMeter) {
        message += `قیمت متری: ${formData.pricePerMeter} تومان\n`;
      }
      message += `قیمت کلی: ${formData.totalPrice} تومان\n`;
    } else {
      message += `قیمت: ${formData.price} تومان\n`;
    }
    
    message += `شرایط فروش: ${formData.saleConditions.join(', ')}\n`;
    
    if (formData.saleConditionDetails) {
      message += `توضیحات شرایط فروش: ${formData.saleConditionDetails}\n`;
    }
    
    message += `آدرس: ${formData.address}\n`;
    
    return message;
  }
  
  // توابع فرمت‌بندی اطلاعات هر نوع ملک
  function formatApartmentDetails(details) {
    let message = `----- اطلاعات آپارتمان -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `متراژ واحد: ${details.unitArea} متر\n`;
    message += `تعداد اتاق‌ها: ${details.roomCount}\n`;
    message += `سال ساخت: ${details.buildYear}\n\n`;
    
    if (details.kitchen.length > 0) {
      message += `مشخصات آشپزخانه: ${details.kitchen.join(', ')}\n`;
    }
    
    if (details.otherKitchen) {
      message += `سایر موارد آشپزخانه: ${details.otherKitchen}\n`;
    }
    
    if (details.facilities.length > 0) {
      message += `تاسیسات: ${details.facilities.join(', ')}\n`;
    }
    
    if (details.otherFacilities) {
      message += `سایر تاسیسات: ${details.otherFacilities}\n`;
    }
    
    if (details.amenities.length > 0) {
      message += `امکانات: ${details.amenities.join(', ')}\n`;
    }
    
    if (details.otherAmenities) {
      message += `سایر امکانات: ${details.otherAmenities}\n`;
    }
    
    if (details.commonAreas.length > 0) {
      message += `مشاعات: ${details.commonAreas.join(', ')}\n`;
    }
    
    if (details.otherCommonAreas) {
      message += `سایر مشاعات: ${details.otherCommonAreas}\n`;
    }
    
    if (details.otherDetails) {
      message += `سایر توضیحات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  function formatVillaDetails(details) {
    let message = `----- اطلاعات ویلا -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `متراژ بنا: ${details.buildingArea} متر\n`;
    message += `تعداد اتاق‌ها: ${details.roomCount}\n`;
    message += `سال ساخت: ${details.buildYear}\n\n`;
    
    if (details.kitchen.length > 0) {
      message += `مشخصات آشپزخانه: ${details.kitchen.join(', ')}\n`;
    }
    
    if (details.otherKitchen) {
      message += `سایر موارد آشپزخانه: ${details.otherKitchen}\n`;
    }
    
    if (details.facilities.length > 0) {
      message += `تاسیسات: ${details.facilities.join(', ')}\n`;
    }
    
    if (details.otherFacilities) {
      message += `سایر تاسیسات: ${details.otherFacilities}\n`;
    }
    
    if (details.amenities.length > 0) {
      message += `امکانات: ${details.amenities.join(', ')}\n`;
    }
    
    if (details.otherAmenities) {
      message += `سایر امکانات: ${details.otherAmenities}\n`;
    }
    
    if (details.otherDetails) {
      message += `سایر توضیحات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  function formatLandDetails(details) {
    let message = `----- اطلاعات زمین -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `کاربری: ${details.landUsage}\n`;
    
    if (details.landWidth) {
      message += `بَر زمین: ${details.landWidth} متر\n`;
    }
    
    if (details.landDepth) {
      message += `عمق زمین: ${details.landDepth} متر\n`;
    }
    
    if (details.alleyWidth) {
      message += `عرض کوچه: ${details.alleyWidth} متر\n`;
    }
    
    if (details.enclosed) {
      message += `محصور: ${details.enclosed}\n`;
    }
    
    if (details.position) {
      message += `موقعیت: ${details.position}\n`;
    }
    
    if (details.otherDetails) {
      message += `سایر توضیحات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  function formatCommercialDetails(details) {
    let message = `----- اطلاعات تجاری -----\n`;
    
    message += `متراژ مغازه: ${details.shopArea} متر\n`;
    
    if (details.shopHeight) {
      message += `ارتفاع مغازه: ${details.shopHeight} متر\n`;
    }
    
    if (details.shopWidth) {
      message += `دهنه مغازه: ${details.shopWidth} متر\n`;
    }
    
    if (details.shopDetails) {
      message += `توضیحات شکل مغازه: ${details.shopDetails}\n`;
    }
    
    if (details.otherDetails) {
      message += `امکانات و سایر توضیحات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  function formatOldDetails(details) {
    let message = `----- اطلاعات کلنگی -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `متراژ بنا: ${details.buildingArea} متر\n`;
    
    if (details.livability) {
      message += `وضعیت سکونت: ${details.livability}\n`;
    }
    
    if (details.landWidth) {
      message += `بَر زمین: ${details.landWidth} متر\n`;
    }
    
    if (details.landDepth) {
      message += `عمق زمین: ${details.landDepth} متر\n`;
    }
    
    if (details.utilities.length > 0) {
      message += `امتیازات: ${details.utilities.join(', ')}\n`;
    }
    
    if (details.amenities) {
      message += `امکانات: ${details.amenities}\n`;
    }
    
    return message;
  }
  
  function formatPresaleApartmentDetails(details) {
    let message = `----- اطلاعات پیش‌فروش آپارتمان -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `متراژ واحد: ${details.unitArea} متر\n`;
    message += `تعداد اتاق: ${details.roomCount}\n`;
    
    if (details.floorCount) {
      message += `تعداد طبقه: ${details.floorCount}\n`;
    }
    
    if (details.floorNumber) {
      message += `طبقه چندم: ${details.floorNumber}\n`;
    }
    
    if (details.unitsPerFloor) {
      message += `تعداد واحد در هر طبقه: ${details.unitsPerFloor}\n`;
    }
    
    if (details.moreDetails) {
      message += `توضیحات بیشتر: ${details.moreDetails}\n`;
    }
    
    if (details.kitchen.length > 0) {
      message += `مشخصات آشپزخانه: ${details.kitchen.join(', ')}\n`;
    }
    
    if (details.otherKitchen) {
      message += `توضیحات آشپزخانه: ${details.otherKitchen}\n`;
    }
    
    if (details.otherDetails) {
      message += `سایر توضیحات و امکانات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  function formatPresaleVillaDetails(details) {
    let message = `----- اطلاعات پیش‌فروش ویلا -----\n`;
    
    if (details.location) {
      message += `موقعیت: ${details.location}\n`;
    }
    
    if (details.otherLocation) {
      message += `سایر موارد موقعیت: ${details.otherLocation}\n`;
    }
    
    message += `متراژ زمین: ${details.landArea} متر\n`;
    message += `متراژ بنا: ${details.buildingArea} متر\n`;
    message += `تعداد اتاق‌ها: ${details.roomCount}\n`;
    message += `تعداد طبقات: ${details.floorCount}\n`;
    
    if (details.otherDetails) {
      message += `سایر توضیحات و امکانات: ${details.otherDetails}\n`;
    }
    
    return message;
  }
  
  // اضافه کردن محدودیت فقط فارسی برای فیلدهای مشخص شده
  const persianOnlyFields = document.querySelectorAll('.persian-only');
  persianOnlyFields.forEach(field => {
    field.addEventListener('input', function() {
      // حذف کاراکترهای غیر فارسی، اعداد فارسی و عربی، نقطه، ویرگول، و فاصله
      const persianRegex = /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u1E00-\u1EFF\s.,0-9۰-۹]/g;
      this.value = this.value.replace(persianRegex, '');
    });
  });
  
  // اضافه کردن محدودیت فقط عددی برای فیلدهای مشخص شده
  const numericOnlyFields = document.querySelectorAll('.numeric-only');
  numericOnlyFields.forEach(field => {
    field.addEventListener('input', function() {
      // حذف کاراکترهای غیر عددی
      this.value = this.value.replace(/[^0-9۰-۹]/g, '');
    });
  });
  
  // اضافه کردن فرمت‌بندی قیمت برای فیلدهای قیمت
  const priceFields = document.querySelectorAll('.price-input');
  priceFields.forEach(field => {
    field.addEventListener('input', function() {
      // حذف کاراکترهای غیر عددی
      let value = this.value.replace(/[^0-9۰-۹]/g, '');
      
      // تبدیل اعداد فارسی به انگلیسی
      value = value.replace(/[۰-۹]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) - 1728);
      });
      
      // اضافه کردن کاما به عنوان جداکننده هزارگان
      if (value) {
        value = Number(value).toLocaleString('fa-IR');
      }
      
      this.value = value;
    });
  });
});