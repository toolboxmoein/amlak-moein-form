document.addEventListener('DOMContentLoaded', function() {
  // تعریف متغیرهای مورد نیاز
  const form = document.getElementById('propertyForm');
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  const presaleTypeSection = document.getElementById('presaleTypeSection');
  const apartmentDetails = document.getElementById('apartmentDetails');
  const villaDetails = document.getElementById('villaDetails');
  const landDetails = document.getElementById('landDetails');
  const commercialDetails = document.getElementById('commercialDetails');
  const oldDetails = document.getElementById('oldDetails');
  const presaleApartmentDetails = document.getElementById('presaleApartmentDetails');
  const presaleVillaDetails = document.getElementById('presaleVillaDetails');
  const commonDetails = document.getElementById('commonDetails');
  const imageUploadSection = document.getElementById('imageUploadSection');
  const priceSectionMeter = document.getElementById('priceSection-meter');
  const priceSectionNormal = document.getElementById('priceSection-normal');
  const resetBtn = document.getElementById('resetBtn');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  const successOverlay = document.getElementById('successOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  
  // تنظیمات تلگرام
  const TELEGRAM_BOT_TOKEN = '6928869739:AAHJBmkpGOQb-YZSRQjf_Hhb2Wy5XoHrLjI';
  const TELEGRAM_CHAT_ID = '179124746';
  
  // آرایه‌ای برای نگهداری فایل‌های عکس
  let selectedImages = [];
  
  // باز کردن منوی همبرگری
  hamburgerMenu.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });
  
  // بستن منوی همبرگری
  menuClose.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });
  
  // بستن پیام موفقیت
  closeSuccessBtn.addEventListener('click', function() {
    successOverlay.style.display = 'none';
  });
  
  // کلیک بیرون از منو برای بستن منو
  menuOverlay.addEventListener('click', function(e) {
    if (e.target === menuOverlay) {
      menuOverlay.style.display = 'none';
    }
  });
  
  // تغییر نوع ملک
  propertyTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // مخفی کردن همه جزئیات
      hideAllDetails();
      
      // نمایش جزئیات مربوط به نوع انتخاب شده
      if (this.value === 'آپارتمان') {
        apartmentDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
        priceSectionNormal.classList.add('hidden');
      } else if (this.value === 'ویلا') {
        villaDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionNormal.classList.remove('hidden');
        priceSectionMeter.classList.add('hidden');
      } else if (this.value === 'زمین') {
        landDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
        priceSectionNormal.classList.add('hidden');
      } else if (this.value === 'تجاری') {
        commercialDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
        priceSectionNormal.classList.add('hidden');
      } else if (this.value === 'کلنگی') {
        oldDetails.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionNormal.classList.remove('hidden');
        priceSectionMeter.classList.add('hidden');
      } else if (this.value === 'پیش‌فروش') {
        presaleTypeSection.classList.remove('hidden');
        commonDetails.classList.remove('hidden');
        imageUploadSection.classList.remove('hidden');
        priceSectionNormal.classList.remove('hidden');
        priceSectionMeter.classList.add('hidden');
      }
    });
  });
  
  // تغییر نوع پیش فروش
  presaleTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'آپارتمان') {
        presaleApartmentDetails.classList.remove('hidden');
        presaleVillaDetails.classList.add('hidden');
      } else if (this.value === 'ویلا') {
        presaleVillaDetails.classList.remove('hidden');
        presaleApartmentDetails.classList.add('hidden');
      }
    });
  });
  
  // مخفی کردن همه جزئیات
  function hideAllDetails() {
    apartmentDetails.classList.add('hidden');
    villaDetails.classList.add('hidden');
    landDetails.classList.add('hidden');
    commercialDetails.classList.add('hidden');
    oldDetails.classList.add('hidden');
    presaleTypeSection.classList.add('hidden');
    presaleApartmentDetails.classList.add('hidden');
    presaleVillaDetails.classList.add('hidden');
  }
  
  // اعتبارسنجی نام و نام خانوادگی (فقط حروف فارسی)
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  
  firstNameInput.addEventListener('input', validatePersianName);
  lastNameInput.addEventListener('input', validatePersianName);
  
  function validatePersianName() {
    const persianPattern = /^[\u0600-\u06FF\s]+$/;
    
    if (firstNameInput.value && !persianPattern.test(firstNameInput.value)) {
      firstNameError.classList.remove('hidden');
      firstNameInput.classList.add('error-field');
      return false;
    } else {
      firstNameError.classList.add('hidden');
      firstNameInput.classList.remove('error-field');
    }
    
    if (lastNameInput.value && !persianPattern.test(lastNameInput.value)) {
      lastNameError.classList.remove('hidden');
      lastNameInput.classList.add('error-field');
      return false;
    } else {
      lastNameError.classList.add('hidden');
      lastNameInput.classList.remove('error-field');
    }
    
    return true;
  }
  
  // اعتبارسنجی شماره تماس (فقط اعداد و 11 رقم)
  const phoneInput = document.getElementById('phone');
  const altPhoneInput = document.getElementById('altPhone');
  const phoneError = document.getElementById('phoneError');
  const altPhoneError = document.getElementById('altPhoneError');
  
  phoneInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    validatePhone();
  });
  
  altPhoneInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    validateAltPhone();
  });
  
  function validatePhone() {
    if (phoneInput.value && phoneInput.value.length !== 11) {
      phoneError.classList.remove('hidden');
      phoneInput.classList.add('error-field');
      return false;
    } else {
      phoneError.classList.add('hidden');
      phoneInput.classList.remove('error-field');
      return true;
    }
  }
  
  function validateAltPhone() {
    if (altPhoneInput.value && !/^\d+$/.test(altPhoneInput.value)) {
      altPhoneError.classList.remove('hidden');
      altPhoneInput.classList.add('error-field');
      return false;
    } else {
      altPhoneError.classList.add('hidden');
      altPhoneInput.classList.remove('error-field');
      return true;
    }
  }
  
  // آپلود عکس
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  
  imageUpload.addEventListener('change', handleImageUpload);
  
  function handleImageUpload(e) {
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // فقط فایل‌های تصویری را قبول کن
      if (!file.type.match('image.*')) {
        continue;
      }
      
      // اضافه کردن به آرایه فایل‌ها
      selectedImages.push(file);
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        
        const removeBtn = document.createElement('div');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '5px';
        removeBtn.style.right = '5px';
        removeBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        removeBtn.style.color = 'white';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.textAlign = 'center';
        removeBtn.style.lineHeight = '20px';
        removeBtn.style.cursor = 'pointer';
        
        removeBtn.addEventListener('click', function() {
          // حذف تصویر از آرایه
          const imgIndex = Array.from(imagePreview.children).indexOf(imgContainer);
          if (imgIndex > -1) {
            selectedImages.splice(imgIndex, 1);
          }
          imagePreview.removeChild(imgContainer);
        });
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        imagePreview.appendChild(imgContainer);
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  // قابلیت کشیدن و رها کردن عکس
  const uploadBtnWrapper = document.querySelector('.upload-btn-wrapper');
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadBtnWrapper.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadBtnWrapper.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadBtnWrapper.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    uploadBtnWrapper.querySelector('.upload-btn').style.borderColor = '#007BFF';
    uploadBtnWrapper.querySelector('.upload-btn').style.backgroundColor = '#f0f8ff';
  }
  
  function unhighlight() {
    uploadBtnWrapper.querySelector('.upload-btn').style.borderColor = '#ccc';
    uploadBtnWrapper.querySelector('.upload-btn').style.backgroundColor = 'white';
  }
  
  uploadBtnWrapper.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    imageUpload.files = files;
    
    // شبیه‌سازی رویداد تغییر برای فراخوانی تابع آپلود عکس
    const event = new Event('change', { bubbles: true });
    imageUpload.dispatchEvent(event);
  }
  
  // ارسال فرم
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // اعتبارسنجی فرم
    if (!validateForm()) {
      return;
    }
    
    // جمع‌آوری داده‌ها
    const formData = collectFormData();
    
    // ارسال به تلگرام
    sendToTelegram(formData);
  });
  
  // اعتبارسنجی فرم
  function validateForm() {
    let isValid = true;
    
    // اعتبارسنجی نام و نام خانوادگی
    if (!validatePersianName()) {
      isValid = false;
    }
    
    // اعتبارسنجی شماره تماس
    if (!validatePhone()) {
      isValid = false;
    }
    
    // اعتبارسنجی شماره تماس دیگر
    if (!validateAltPhone()) {
      isValid = false;
    }
    
    // اعتبارسنجی نوع ملک
    const propertyTypeSelected = document.querySelector('input[name="propertyType"]:checked');
    const typeError = document.getElementById('typeError');
    if (!propertyTypeSelected) {
      typeError.classList.remove('hidden');
      isValid = false;
    } else {
      typeError.classList.add('hidden');
    }
    
    // اعتبارسنجی وضعیت سند
    if (!commonDetails.classList.contains('hidden')) {
      const documentSelected = document.querySelector('input[name="document"]:checked');
      const documentError = document.getElementById('documentError');
      if (!documentSelected && !document.getElementById('otherDocument').value) {
        documentError.classList.remove('hidden');
        isValid = false;
      } else {
        documentError.classList.add('hidden');
      }
      
      // اعتبارسنجی شرایط فروش
      const saleConditionSelected = document.querySelector('input[name="saleConditions"]:checked');
      const saleConditionError = document.getElementById('saleConditionError');
      if (!saleConditionSelected) {
        saleConditionError.classList.remove('hidden');
        isValid = false;
      } else {
        saleConditionError.classList.add('hidden');
      }
    }
    
    return isValid;
  }
  
  // جمع‌آوری داده‌های فرم
  function collectFormData() {
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      phone: document.getElementById('phone').value,
      altPhone: document.getElementById('altPhone').value,
      propertyType: document.querySelector('input[name="propertyType"]:checked')?.value || '',
    };
    
    // اضافه کردن داده‌های مختص نوع ملک
    if (formData.propertyType === 'آپارتمان') {
      // اینجا مشکل لوکیشن را اصلاح کردیم
      const locationRadio = document.querySelector('input[name="location-apartment"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-apartment').value;
      formData.landArea = document.getElementById('landArea-apartment').value;
      formData.unitArea = document.getElementById('unitArea-apartment').value;
      formData.roomCount = document.getElementById('roomCount-apartment').value;
      formData.buildYear = document.getElementById('buildYear-apartment').value;
      
      // مشخصات آشپزخانه
      formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-apartment"]:checked')).map(el => el.value).join(', ');
      formData.otherKitchen = document.getElementById('otherKitchen-apartment').value;
      
      // تاسیسات
      formData.facilities = Array.from(document.querySelectorAll('input[name="facilities-apartment"]:checked')).map(el => el.value).join(', ');
      formData.otherFacilities = document.getElementById('otherFacilities-apartment').value;
      
      // سایر امکانات
      formData.amenities = Array.from(document.querySelectorAll('input[name="amenities-apartment"]:checked')).map(el => el.value).join(', ');
      formData.otherAmenities = document.getElementById('otherAmenities-apartment').value;
      
      // مشاعات
      formData.commonAreas = Array.from(document.querySelectorAll('input[name="commonAreas-apartment"]:checked')).map(el => el.value).join(', ');
      formData.otherCommonAreas = document.getElementById('otherCommonAreas-apartment').value;
      
      // سایر توضیحات
      formData.otherDetails = document.getElementById('otherDetails-apartment').value;
      
      // قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value;
      formData.totalPrice = document.getElementById('totalPrice').value;
      
    } else if (formData.propertyType === 'ویلا') {
      // اینجا مشکل لوکیشن را اصلاح کردیم
      const locationRadio = document.querySelector('input[name="location-villa"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-villa').value;
      formData.landArea = document.getElementById('landArea-villa').value;
      formData.buildingArea = document.getElementById('buildingArea-villa').value;
      formData.roomCount = document.getElementById('roomCount-villa').value;
      formData.buildYear = document.getElementById('buildYear-villa').value;
      
      // مشخصات آشپزخانه
      formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-villa"]:checked')).map(el => el.value).join(', ');
      formData.otherKitchen = document.getElementById('otherKitchen-villa').value;
      
      // تاسیسات
      formData.facilities = Array.from(document.querySelectorAll('input[name="facilities-villa"]:checked')).map(el => el.value).join(', ');
      formData.otherFacilities = document.getElementById('otherFacilities-villa').value;
      
      // امکانات
      formData.amenities = Array.from(document.querySelectorAll('input[name="amenities-villa"]:checked')).map(el => el.value).join(', ');
      formData.otherAmenities = document.getElementById('otherAmenities-villa').value;
      
      // سایر توضیحات
      formData.otherDetails = document.getElementById('otherDetails-villa').value;
      
      // قیمت
      formData.price = document.getElementById('price').value;
      
    } else if (formData.propertyType === 'زمین') {
      // اینجا مشکل لوکیشن را اصلاح کردیم
      const locationRadio = document.querySelector('input[name="location-land"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-land').value;
      formData.landArea = document.getElementById('landArea-land').value;
      formData.landUsage = document.getElementById('landUsage').value;
      formData.landWidth = document.getElementById('landWidth').value;
      formData.landDepth = document.getElementById('landDepth').value;
      formData.alleyWidth = document.getElementById('alleyWidth').value;
      formData.enclosed = document.querySelector('input[name="enclosed"]:checked')?.value || '';
      formData.position = document.querySelector('input[name="position"]:checked')?.value || '';
      formData.otherDetails = document.getElementById('otherDetails-land').value;
      
      // قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value;
      formData.totalPrice = document.getElementById('totalPrice').value;
      
    } else if (formData.propertyType === 'تجاری') {
      formData.shopArea = document.getElementById('shopArea').value;
      formData.shopHeight = document.getElementById('shopHeight').value;
      formData.shopWidth = document.getElementById('shopWidth').value;
      formData.shopDetails = document.getElementById('shopDetails').value;
      formData.otherDetails = document.getElementById('otherDetails-commercial').value;
      
      // قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value;
      formData.totalPrice = document.getElementById('totalPrice').value;
      
    } else if (formData.propertyType === 'کلنگی') {
      // اینجا مشکل لوکیشن را اصلاح کردیم
      const locationRadio = document.querySelector('input[name="location-old"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-old').value;
      formData.landArea = document.getElementById('landArea-old').value;
      formData.buildingArea = document.getElementById('buildingArea-old').value;
      formData.livability = document.querySelector('input[name="livability"]:checked')?.value || '';
      formData.landWidth = document.getElementById('landWidth-old').value;
      formData.landDepth = document.getElementById('landDepth-old').value;
      formData.utilities = Array.from(document.querySelectorAll('input[name="utilities"]:checked')).map(el => el.value).join(', ');
      formData.amenities = document.getElementById('amenities-old').value;
      
      // قیمت
      formData.price = document.getElementById('price').value;
      
    } else if (formData.propertyType === 'پیش‌فروش') {
      formData.presaleType = document.querySelector('input[name="presaleType"]:checked')?.value || '';
      formData.projectProgress = document.getElementById('projectProgress').value;
      
      if (formData.presaleType === 'آپارتمان') {
        // اینجا مشکل لوکیشن را اصلاح کردیم
        const locationRadio = document.querySelector('input[name="location-presale-apartment"]:checked');
        formData.location = locationRadio ? locationRadio.value : '';
        formData.otherLocation = document.getElementById('otherLocation-presale-apartment').value;
        formData.landArea = document.getElementById('landArea-presale-apartment').value;
        formData.unitArea = document.getElementById('unitArea-presale-apartment').value;
        formData.roomCount = document.getElementById('roomCount-presale-apartment').value;
        formData.floorCount = document.getElementById('floorCount-presale-apartment').value;
        formData.floorNumber = document.getElementById('floorNumber-presale-apartment').value;
        formData.unitsPerFloor = document.getElementById('unitsPerFloor-presale-apartment').value;
        formData.moreDetails = document.getElementById('moreDetails-presale-apartment').value;
        formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-presale-apartment"]:checked')).map(el => el.value).join(', ');
        formData.otherKitchen = document.getElementById('otherKitchen-presale-apartment').value;
        formData.otherDetails = document.getElementById('otherDetails-presale-apartment').value;
      } else if (formData.presaleType === 'ویلا') {
        // اینجا مشکل لوکیشن را اصلاح کردیم
        const locationRadio = document.querySelector('input[name="location-presale-villa"]:checked');
        formData.location = locationRadio ? locationRadio.value : '';
        formData.otherLocation = document.getElementById('otherLocation-presale-villa').value;
        formData.landArea = document.getElementById('landArea-presale-villa').value;
        formData.buildingArea = document.getElementById('buildingArea-presale-villa').value;
        formData.roomCount = document.getElementById('roomCount-presale-villa').value;
        formData.floorCount = document.getElementById('floorCount-presale-villa').value;
        formData.otherDetails = document.getElementById('otherDetails-presale-villa').value;
      }
      
      // قیمت
      formData.price = document.getElementById('price').value;
    }
    
    // اضافه کردن داده‌های مشترک
    if (!commonDetails.classList.contains('hidden')) {
      formData.document = Array.from(document.querySelectorAll('input[name="document"]:checked')).map(el => el.value).join(', ');
      formData.otherDocument = document.getElementById('otherDocument').value;
      formData.saleConditions = Array.from(document.querySelectorAll('input[name="saleConditions"]:checked')).map(el => el.value).join(', ');
      formData.saleConditionDetails = document.getElementById('saleConditionDetails').value;
      formData.address = document.getElementById('address').value;
    }
    
    return formData;
  }
  
  // ارسال داده‌ها به تلگرام
  function sendToTelegram(formData) {
    // ساخت متن پیام - فقط مقادیر بدون عنوان
    let message = '';
    
    message += `${formData.firstName} ${formData.lastName}\n`;
    message += `${formData.phone}\n`;
    
    if (formData.altPhone) {
      message += `${formData.altPhone}\n`;
    }
    
    message += `${formData.propertyType}\n`;
    
    // اضافه کردن داده‌های مختص نوع ملک
    if (formData.propertyType === 'آپارتمان') {
      if (formData.location) {
        message += `${formData.location}`;
        if (formData.otherLocation) {
          message += ` - ${formData.otherLocation}`;
        }
        message += '\n';
      }
      
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.unitArea} متر واحد\n`;
      message += `${formData.roomCount} اتاق\n`;
      message += `سال ساخت: ${formData.buildYear}\n`;
      
      if (formData.kitchen) {
        message += `${formData.kitchen}`;
        if (formData.otherKitchen) {
          message += ` - ${formData.otherKitchen}`;
        }
        message += '\n';
      }
      
      if (formData.facilities) {
        message += `${formData.facilities}`;
        if (formData.otherFacilities) {
          message += ` - ${formData.otherFacilities}`;
        }
        message += '\n';
      }
      
      if (formData.amenities) {
        message += `${formData.amenities}`;
        if (formData.otherAmenities) {
          message += ` - ${formData.otherAmenities}`;
        }
        message += '\n';
      }
      
      if (formData.commonAreas) {
        message += `${formData.commonAreas}`;
        if (formData.otherCommonAreas) {
          message += ` - ${formData.otherCommonAreas}`;
        }
        message += '\n';
      }
      
      if (formData.otherDetails) {
        message += `${formData.otherDetails}\n`;
      }
      
      if (formData.pricePerMeter) {
        message += `${formData.pricePerMeter} تومان متری\n`;
      }
      
      message += `${formData.totalPrice} تومان کل\n`;
      
    } else if (formData.propertyType === 'ویلا') {
      if (formData.location) {
        message += `${formData.location}`;
        if (formData.otherLocation) {
          message += ` - ${formData.otherLocation}`;
        }
        message += '\n';
      }
      
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.buildingArea} متر بنا\n`;
      message += `${formData.roomCount} اتاق\n`;
      message += `سال ساخت: ${formData.buildYear}\n`;
      
      if (formData.kitchen) {
        message += `${formData.kitchen}`;
        if (formData.otherKitchen) {
          message += ` - ${formData.otherKitchen}`;
        }
        message += '\n';
      }
      
      if (formData.facilities) {
        message += `${formData.facilities}`;
        if (formData.otherFacilities) {
          message += ` - ${formData.otherFacilities}`;
        }
        message += '\n';
      }
      
      if (formData.amenities) {
        message += `${formData.amenities}`;
        if (formData.otherAmenities) {
          message += ` - ${formData.otherAmenities}`;
        }
        message += '\n';
      }
      
      if (formData.otherDetails) {
        message += `${formData.otherDetails}\n`;
      }
      
      message += `${formData.price} تومان\n`;
      
    } else if (formData.propertyType === 'زمین') {
      if (formData.location) {
        message += `${formData.location}`;
        if (formData.otherLocation) {
          message += ` - ${formData.otherLocation}`;
        }
        message += '\n';
      }
      
      message += `${formData.landArea} متر زمین\n`;
      message += `کاربری: ${formData.landUsage}\n`;
      
      if (formData.landWidth) {
        message += `بَر زمین: ${formData.landWidth} متر\n`;
      }
      
      if (formData.landDepth) {
        message += `عمق زمین: ${formData.landDepth} متر\n`;
      }
      
      if (formData.alleyWidth) {
        message += `عرض کوچه: ${formData.alleyWidth} متر\n`;
      }
      
      if (formData.enclosed) {
        message += `محصور: ${formData.enclosed}\n`;
      }
      
      if (formData.position) {
        message += `موقعیت: ${formData.position}\n`;
      }
      
      if (formData.otherDetails) {
        message += `${formData.otherDetails}\n`;
      }
      
      if (formData.pricePerMeter) {
        message += `${formData.pricePerMeter} تومان متری\n`;
      }
      
      message += `${formData.totalPrice} تومان کل\n`;
      
    } else if (formData.propertyType === 'تجاری') {
      message += `${formData.shopArea} متر مغازه\n`;
      
      if (formData.shopHeight) {
        message += `ارتفاع مغازه: ${formData.shopHeight} متر\n`;
      }
      
      if (formData.shopWidth) {
        message += `دهنه مغازه: ${formData.shopWidth} متر\n`;
      }
      
      if (formData.shopDetails) {
        message += `${formData.shopDetails}\n`;
      }
      
      if (formData.otherDetails) {
        message += `${formData.otherDetails}\n`;
      }
      
      if (formData.pricePerMeter) {
        message += `${formData.pricePerMeter} تومان متری\n`;
      }
      
      message += `${formData.totalPrice} تومان کل\n`;
      
    } else if (formData.propertyType === 'کلنگی') {
      if (formData.location) {
        message += `${formData.location}`;
        if (formData.otherLocation) {
          message += ` - ${formData.otherLocation}`;
        }
        message += '\n';
      }
      
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.buildingArea} متر بنا\n`;
      
      if (formData.livability) {
        message += `وضعیت سکونت: ${formData.livability}\n`;
      }
      
      if (formData.landWidth) {
        message += `بَر زمین: ${formData.landWidth} متر\n`;
      }
      
      if (formData.landDepth) {
        message += `عمق زمین: ${formData.landDepth} متر\n`;
      }
      
      if (formData.utilities) {
        message += `امتیازات: ${formData.utilities}\n`;
      }
      
      if (formData.amenities) {
        message += `امکانات: ${formData.amenities}\n`;
      }
      
      message += `${formData.price} تومان\n`;
      
    } else if (formData.propertyType === 'پیش‌فروش') {
      message += `نوع پیش‌فروش: ${formData.presaleType}\n`;
      message += `وضعیت پروژه: ${formData.projectProgress}\n`;
      
      if (formData.presaleType === 'آپارتمان') {
        if (formData.location) {
          message += `${formData.location}`;
          if (formData.otherLocation) {
            message += ` - ${formData.otherLocation}`;
          }
          message += '\n';
        }
        
        message += `${formData.landArea} متر زمین\n`;
        message += `${formData.unitArea} متر واحد\n`;
        message += `${formData.roomCount} اتاق\n`;
        
        if (formData.floorCount) {
          message += `تعداد طبقات: ${formData.floorCount}\n`;
        }
        
        if (formData.floorNumber) {
          message += `طبقه: ${formData.floorNumber}\n`;
        }
        
        if (formData.unitsPerFloor) {
          message += `تعداد واحد در هر طبقه: ${formData.unitsPerFloor}\n`;
        }
        
        if (formData.moreDetails) {
          message += `${formData.moreDetails}\n`;
        }
        
        if (formData.kitchen) {
          message += `${formData.kitchen}`;
          if (formData.otherKitchen) {
            message += ` - ${formData.otherKitchen}`;
          }
          message += '\n';
        }
        
        if (formData.otherDetails) {
          message += `${formData.otherDetails}\n`;
        }
        
      } else if (formData.presaleType === 'ویلا') {
        if (formData.location) {
          message += `${formData.location}`;
          if (formData.otherLocation) {
            message += ` - ${formData.otherLocation}`;
          }
          message += '\n';
        }
        
        message += `${formData.landArea} متر زمین\n`;
        message += `${formData.buildingArea} متر بنا\n`;
        message += `${formData.roomCount} اتاق\n`;
        message += `تعداد طبقات: ${formData.floorCount}\n`;
        
        if (formData.otherDetails) {
          message += `${formData.otherDetails}\n`;
        }
      }
      
      message += `${formData.price} تومان\n`;
    }
    
    // اضافه کردن داده‌های مشترک
    if (formData.document) {
      message += `سند: ${formData.document}`;
      if (formData.otherDocument) {
        message += ` - ${formData.otherDocument}`;
      }
      message += '\n';
    }
    
    if (formData.saleConditions) {
      message += `شرایط فروش: ${formData.saleConditions}`;
      if (formData.saleConditionDetails) {
        message += ` - ${formData.saleConditionDetails}`;
      }
      message += '\n';
    }
    
    message += `آدرس: ${formData.address}\n`;
    
    // ارسال متن به تلگرام
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        // ارسال عکس‌ها
        if (selectedImages.length > 0) {
          sendImagesToTelegram();
        } else {
          // نمایش پیام موفقیت
          successOverlay.style.display = 'flex';
          
          // پاک کردن فرم
          form.reset();
          imagePreview.innerHTML = '';
          selectedImages = [];
          hideAllDetails();
        }
      } else {
        alert('خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    });
  }
  
  // ارسال عکس‌ها به تلگرام
  function sendImagesToTelegram() {
    let uploadedCount = 0;
    
    for (let i = 0; i < selectedImages.length; i++) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', selectedImages[i]);
      
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        uploadedCount++;
        
        // اگر همه عکس‌ها آپلود شدند
        if (uploadedCount === selectedImages.length) {
          // نمایش پیام موفقیت
          successOverlay.style.display = 'flex';
          
          // پاک کردن فرم
          form.reset();
          imagePreview.innerHTML = '';
          selectedImages = [];
          hideAllDetails();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        uploadedCount++;
        
        if (uploadedCount === selectedImages.length) {
          alert('برخی از عکس‌ها آپلود نشدند. اما اطلاعات ثبت شد.');
          
          // نمایش پیام موفقیت
          successOverlay.style.display = 'flex';
          
          // پاک کردن فرم
          form.reset();
          imagePreview.innerHTML = '';
          selectedImages = [];
          hideAllDetails();
        }
      });
    }
  }
  
  // پاک کردن فرم
  resetBtn.addEventListener('click', function() {
    // نمایش دیالوگ تأیید
    confirmOverlay.style.display = 'flex';
  });
  
  // تأیید پاک کردن فرم
  confirmYesBtn.addEventListener('click', function() {
    form.reset();
    imagePreview.innerHTML = '';
    selectedImages = [];
    hideAllDetails();
    confirmOverlay.style.display = 'none';
  });
  
  // لغو پاک کردن فرم
  confirmNoBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'none';
  });
  
  // کلیک بیرون از دیالوگ تأیید برای بستن آن
  confirmOverlay.addEventListener('click', function(e) {
    if (e.target === confirmOverlay) {
      confirmOverlay.style.display = 'none';
    }
  });
});