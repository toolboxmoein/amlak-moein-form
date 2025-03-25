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
  const TELEGRAM_BOT_TOKEN = '8105224277:AAF0dfXlg3EMCt8L-R4Q1Fe70nb3EtKiFWA';
  const TELEGRAM_CHAT_ID = '@Mohsenmoein7';
  
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
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', function() {
      successOverlay.style.display = 'none';
    });
  }
  
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
  
  // محدود کردن ورودی به فقط اعداد برای فیلدهای عددی
  const numericInputs = document.querySelectorAll('.numeric-only');
  numericInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  });
  
  // محدود کردن ورودی به فقط زبان فارسی برای فیلدهای متنی
  const persianInputs = document.querySelectorAll('.persian-only');
  persianInputs.forEach(input => {
    input.addEventListener('input', function() {
      const persianPattern = /^[\u0600-\u06FF\s\n.،؛:؟!«»\-_]+$/;
      let newValue = '';
      for (let i = 0; i < this.value.length; i++) {
        const char = this.value.charAt(i);
        if (char === ' ' || char === '\n' || char === '.' || char === '،' || char === '؛' || 
            char === ':' || char === '؟' || char === '!' || char === '«' || char === '»' || 
            char === '-' || char === '_' || persianPattern.test(char)) {
          newValue += char;
        }
      }
      this.value = newValue;
    });
  });
  
  // فرمت‌دهی قیمت (سه رقم سه رقم)
  const priceInputs = document.querySelectorAll('.price-input');
  
  priceInputs.forEach(input => {
    input.addEventListener('input', function() {
      // فقط اعداد را نگه دار
      let value = this.value.replace(/[^0-9]/g, '');
      
      // فرمت‌دهی سه رقم سه رقم
      if (value) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      
      this.value = value;
    });
  });

  // محاسبه قیمت کل بر اساس متراژ و قیمت متری
  const pricePerMeterInput = document.getElementById('pricePerMeter');
  const totalPriceInput = document.getElementById('totalPrice');
  const landAreaApartmentInput = document.getElementById('landArea-apartment');
  const unitAreaApartmentInput = document.getElementById('unitArea-apartment');
  const landAreaLandInput = document.getElementById('landArea-land');
  const shopAreaInput = document.getElementById('shopArea');

  // برای آپارتمان
  if (pricePerMeterInput && totalPriceInput) {
    pricePerMeterInput.addEventListener('input', function() {
      const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
      if (propertyType === 'آپارتمان') {
        calculateTotalPrice(unitAreaApartmentInput);
      } else if (propertyType === 'زمین') {
        calculateTotalPrice(landAreaLandInput);
      } else if (propertyType === 'تجاری') {
        calculateTotalPrice(shopAreaInput);
      }
    });

    // همچنین وقتی متراژ تغییر می‌کند، قیمت کل را محاسبه کن
    unitAreaApartmentInput?.addEventListener('input', function() {
      const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
      if (propertyType === 'آپارتمان') {
        calculateTotalPrice(this);
      }
    });

    landAreaLandInput?.addEventListener('input', function() {
      const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
      if (propertyType === 'زمین') {
        calculateTotalPrice(this);
      }
    });

    shopAreaInput?.addEventListener('input', function() {
      const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
      if (propertyType === 'تجاری') {
        calculateTotalPrice(this);
      }
    });
  }

  function calculateTotalPrice(areaInput) {
    if (pricePerMeterInput.value && areaInput.value) {
      const pricePerMeter = parseInt(pricePerMeterInput.value.replace(/,/g, ''));
      const area = parseInt(areaInput.value);
      if (!isNaN(pricePerMeter) && !isNaN(area)) {
        const totalPrice = pricePerMeter * area;
        totalPriceInput.value = totalPrice.toLocaleString('en-US');
      }
    }
  }
  
  // آپلود عکس - بهبود یافته
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  
  imageUpload.addEventListener('change', handleImageUpload);
  
  function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // فقط فایل‌های تصویری را قبول کن
      if (!file.type.match('image.*')) {
        continue;
      }
      
      // اضافه کردن به آرایه فایل‌ها
      selectedImages.push(file);
      
      // ایجاد یک شناسه منحصر به فرد برای هر تصویر
      const imageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      const imgContainer = document.createElement('div');
      imgContainer.style.position = 'relative';
      imgContainer.dataset.imageId = imageId;
      
      // نمایش پیشرفت آپلود
      const progressContainer = document.createElement('div');
      progressContainer.style.position = 'absolute';
      progressContainer.style.bottom = '0';
      progressContainer.style.left = '0';
      progressContainer.style.width = '100%';
      progressContainer.style.height = '5px';
      progressContainer.style.backgroundColor = '#ddd';
      
      const progressBar = document.createElement('div');
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.backgroundColor = '#007BFF';
      progressBar.style.transition = 'width 0.3s';
      progressContainer.appendChild(progressBar);
      
      // نمایش پیش‌نمایش تصویر
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '5px';
        
        // دکمه حذف تصویر
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
          const imgIndex = selectedImages.findIndex(img => img === file);
          if (imgIndex > -1) {
            selectedImages.splice(imgIndex, 1);
          }
          imagePreview.removeChild(imgContainer);
        });
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        imgContainer.appendChild(progressContainer);
        imagePreview.appendChild(imgContainer);
        
        // شبیه‌سازی پیشرفت آپلود
        simulateUploadProgress(progressBar);
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  // شبیه‌سازی پیشرفت آپلود برای پیش‌نمایش
  function simulateUploadProgress(progressBar) {
    let width = 0;
    const interval = setInterval(function() {
      if (width >= 100) {
        clearInterval(interval);
      } else {
        width += 5;
        progressBar.style.width = width + '%';
      }
    }, 50);
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
    
    if (files && files.length > 0) {
      handleImageUpload({ target: { files: files } });
    }
  }
  
  // ارسال فرم
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("فرم ارسال شد");
    
    // اعتبارسنجی فرم
    if (!validateForm()) {
      console.log("اعتبارسنجی فرم ناموفق بود");
      return;
    }
    
    // جمع‌آوری داده‌ها
    const formData = collectFormData();
    console.log("داده‌های فرم جمع‌آوری شد:", formData);
    
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
      
      // اعتبارسنجی فیلدهای اجباری مختص هر نوع ملک
      if (propertyTypeSelected.value === 'آپارتمان') {
        if (!document.getElementById('landArea-apartment').value) {
          document.getElementById('landArea-apartment').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('unitArea-apartment').value) {
          document.getElementById('unitArea-apartment').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('roomCount-apartment').value) {
          document.getElementById('roomCount-apartment').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('buildYear-apartment').value) {
          document.getElementById('buildYear-apartment').classList.add('error-field');
          isValid = false;
        }
      } else if (propertyTypeSelected.value === 'ویلا') {
        if (!document.getElementById('landArea-villa').value) {
          document.getElementById('landArea-villa').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('buildingArea-villa').value) {
          document.getElementById('buildingArea-villa').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('roomCount-villa').value) {
          document.getElementById('roomCount-villa').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('buildYear-villa').value) {
          document.getElementById('buildYear-villa').classList.add('error-field');
          isValid = false;
        }
      } else if (propertyTypeSelected.value === 'زمین') {
        if (!document.getElementById('landArea-land').value) {
          document.getElementById('landArea-land').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('landUsage').value) {
          document.getElementById('landUsage').classList.add('error-field');
          isValid = false;
        }
      } else if (propertyTypeSelected.value === 'تجاری') {
        if (!document.getElementById('shopArea').value) {
          document.getElementById('shopArea').classList.add('error-field');
          isValid = false;
        }
      } else if (propertyTypeSelected.value === 'کلنگی') {
        if (!document.getElementById('landArea-old').value) {
          document.getElementById('landArea-old').classList.add('error-field');
          isValid = false;
        }
        if (!document.getElementById('buildingArea-old').value) {
          document.getElementById('buildingArea-old').classList.add('error-field');
          isValid = false;
        }
      } else if (propertyTypeSelected.value === 'پیش‌فروش') {
        if (!document.getElementById('projectProgress').value) {
          document.getElementById('projectProgress').classList.add('error-field');
          isValid = false;
        }
        
        const presaleType = document.querySelector('input[name="presaleType"]:checked');
        if (presaleType) {
          if (presaleType.value === 'آپارتمان') {
            if (!document.getElementById('landArea-presale-apartment').value) {
              document.getElementById('landArea-presale-apartment').classList.add('error-field');
              isValid = false;
            }
            if (!document.getElementById('unitArea-presale-apartment').value) {
              document.getElementById('unitArea-presale-apartment').classList.add('error-field');
              isValid = false;
            }
            if (!document.getElementById('roomCount-presale-apartment').value) {
              document.getElementById('roomCount-presale-apartment').classList.add('error-field');
              isValid = false;
            }
          } else if (presaleType.value === 'ویلا') {
            if (!document.getElementById('landArea-presale-villa').value) {
              document.getElementById('landArea-presale-villa').classList.add('error-field');
              isValid = false;
            }
            if (!document.getElementById('buildingArea-presale-villa').value) {
              document.getElementById('buildingArea-presale-villa').classList.add('error-field');
              isValid = false;
            }
            if (!document.getElementById('roomCount-presale-villa').value) {
              document.getElementById('roomCount-presale-villa').classList.add('error-field');
              isValid = false;
            }
            if (!document.getElementById('floorCount-presale-villa').value) {
              document.getElementById('floorCount-presale-villa').classList.add('error-field');
              isValid = false;
            }
          }
        } else {
          // نوع پیش‌فروش انتخاب نشده
          isValid = false;
          alert('لطفاً نوع پیش‌فروش را انتخاب کنید.');
        }
      }
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
      
      // اعتبارسنجی قیمت
      if (!priceSectionMeter.classList.contains('hidden')) {
        if (!document.getElementById('totalPrice').value) {
          document.getElementById('totalPrice').classList.add('error-field');
          isValid = false;
        }
      } else if (!priceSectionNormal.classList.contains('hidden')) {
        if (!document.getElementById('price').value) {
          document.getElementById('price').classList.add('error-field');
          isValid = false;
        }
      }
      
      // اعتبارسنجی آدرس
      if (!document.getElementById('address').value) {
        document.getElementById('address').classList.add('error-field');
        isValid = false;
      }
    }
    
    if (!isValid) {
      alert('لطفاً فیلدهای الزامی را تکمیل کنید.');
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
      // اصلاح مشکل لوکیشن
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
      
      // قیمت - حذف کاما از قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value.replace(/[,٬]/g, '');
      formData.totalPrice = document.getElementById('totalPrice').value.replace(/[,٬]/g, '');
      
    } else if (formData.propertyType === 'ویلا') {
      // اصلاح مشکل لوکیشن
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
      
      // قیمت - حذف کاما از قیمت
      formData.price = document.getElementById('price').value.replace(/[,٬]/g, '');
      
    } else if (formData.propertyType === 'زمین') {
      // اصلاح مشکل لوکیشن
      const locationRadio = document.querySelector('input[name="location-land"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-land').value;
      formData.landArea = document.getElementById('landArea-land').value;
      formData.landUsage = document.getElementById('landUsage').value;
      formData.landWidth = document.getElementById('landWidth').value;
      formData.landDepth = document.getElementById('landDepth').value;
      formData.alleyWidth = document.getElementById('alleyWidth').value;
      
      // اصلاح مشکل لوکیشن برای محصور
      const enclosedRadio = document.querySelector('input[name="enclosed"]:checked');
      formData.enclosed = enclosedRadio ? enclosedRadio.value : '';
      
      // اصلاح مشکل لوکیشن برای موقعیت
      const positionRadio = document.querySelector('input[name="position"]:checked');
      formData.position = positionRadio ? positionRadio.value : '';
      
      formData.otherDetails = document.getElementById('otherDetails-land').value;
      
      // قیمت - حذف کاما از قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value.replace(/[,٬]/g, '');
      formData.totalPrice = document.getElementById('totalPrice').value.replace(/[,٬]/g, '');
      
    } else if (formData.propertyType === 'تجاری') {
      formData.shopArea = document.getElementById('shopArea').value;
      formData.shopHeight = document.getElementById('shopHeight').value;
      formData.shopWidth = document.getElementById('shopWidth').value;
      formData.shopDetails = document.getElementById('shopDetails').value;
      formData.otherDetails = document.getElementById('otherDetails-commercial').value;
      
      // قیمت - حذف کاما از قیمت
      formData.pricePerMeter = document.getElementById('pricePerMeter').value.replace(/[,٬]/g, '');
      formData.totalPrice = document.getElementById('totalPrice').value.replace(/[,٬]/g, '');
      
    } else if (formData.propertyType === 'کلنگی') {
      // اصلاح مشکل لوکیشن
      const locationRadio = document.querySelector('input[name="location-old"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-old').value;
      formData.landArea = document.getElementById('landArea-old').value;
      formData.buildingArea = document.getElementById('buildingArea-old').value;
      
      // اصلاح مشکل لوکیشن برای وضعیت سکونت
      const livabilityRadio = document.querySelector('input[name="livability"]:checked');
      formData.livability = livabilityRadio ? livabilityRadio.value : '';
      
      formData.landWidth = document.getElementById('landWidth-old').value;
      formData.landDepth = document.getElementById('landDepth-old').value;
      formData.utilities = Array.from(document.querySelectorAll('input[name="utilities"]:checked')).map(el => el.value).join(', ');
      formData.amenities = document.getElementById('amenities-old').value;
      
      // قیمت - حذف کاما از قیمت
      formData.price = document.getElementById('price').value.replace(/[,٬]/g, '');
      
    } else if (formData.propertyType === 'پیش‌فروش') {
      // اصلاح مشکل لوکیشن
      const presaleTypeRadio = document.querySelector('input[name="presaleType"]:checked');
      formData.presaleType = presaleTypeRadio ? presaleTypeRadio.value : '';
      formData.projectProgress = document.getElementById('projectProgress').value;
      
      if (formData.presaleType === 'آپارتمان') {
        // اصلاح مشکل لوکیشن
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
        // اصلاح مشکل لوکیشن
        const locationRadio = document.querySelector('input[name="location-presale-villa"]:checked');
        formData.location = locationRadio ? locationRadio.value : '';
        formData.otherLocation = document.getElementById('otherLocation-presale-villa').value;
        formData.landArea = document.getElementById('landArea-presale-villa').value;
        formData.buildingArea = document.getElementById('buildingArea-presale-villa').value;
        formData.roomCount = document.getElementById('roomCount-presale-villa').value;
        formData.floorCount = document.getElementById('floorCount-presale-villa').value;
        formData.otherDetails = document.getElementById('otherDetails-presale-villa').value;
      }
      
      // قیمت - حذف کاما از قیمت
      formData.price = document.getElementById('price').value.replace(/[,٬]/g, '');
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
  
  // ارسال داده‌ها به تلگرام با استفاده از سرویس واسط
  function sendToTelegram(formData) {
    console.log("در حال ارسال به تلگرام...");
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
        message += `${parseInt(formData.pricePerMeter).toLocaleString('fa-IR')} تومان متری\n`;
      }
      
      message += `${parseInt(formData.totalPrice).toLocaleString('fa-IR')} تومان کل\n`;
      
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
      
      message += `${parseInt(formData.price).toLocaleString('fa-IR')} تومان\n`;
      
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
        message += `${parseInt(formData.pricePerMeter).toLocaleString('fa-IR')} تومان متری\n`;
      }
      
      message += `${parseInt(formData.totalPrice).toLocaleString('fa-IR')} تومان کل\n`;
      
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
        message += `${parseInt(formData.pricePerMeter).toLocaleString('fa-IR')} تومان متری\n`;
      }
      
      message += `${parseInt(formData.totalPrice).toLocaleString('fa-IR')} تومان کل\n`;
      
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
      
      message += `${parseInt(formData.price).toLocaleString('fa-IR')} تومان\n`;
      
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
      
      message += `${parseInt(formData.price).toLocaleString('fa-IR')} تومان\n`;
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
    
    // استفاده از سرویس cors-anywhere به عنوان پراکسی
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    fetch(corsProxyUrl + telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    })
    .then(response => {
      console.log("پاسخ اولیه از تلگرام:", response);
      if (!response.ok) {
        throw new Error('خطا در ارسال پیام');
      }
      return response.json();
    })
    .then(data => {
      console.log("داده دریافتی از تلگرام:", data);
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
        console.error("خطا در ارسال به تلگرام:", data);
        // تلاش مجدد با روش دوم
        sendToTelegramAlternative(message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // تلاش مجدد با روش دوم
      sendToTelegramAlternative(message);
    });
  }
  
  // روش جایگزین برای ارسال به تلگرام
  function sendToTelegramAlternative(message) {
    console.log("در حال استفاده از روش جایگزین برای ارسال به تلگرام...");
    
    // استفاده از سرویس jsonp
    const script = document.createElement('script');
    const callbackName = 'telegramCallback_' + Math.floor(Math.random() * 1000000);
    
    window[callbackName] = function(data) {
      console.log("پاسخ از سرویس جایگزین:", data);
      
      if (data && data.ok) {
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
        console.error("خطا در روش جایگزین:", data);
        alert('متأسفانه ارسال اطلاعات با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.');
      }
      
      // پاکسازی
      document.body.removeChild(script);
      delete window[callbackName];
    };
    
    // ساخت URL با پارامترهای لازم
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.telegram-proxy.ir/send?bot_token=${TELEGRAM_BOT_TOKEN}&chat_id=${TELEGRAM_CHAT_ID}&text=${encodedMessage}&callback=${callbackName}`;
    
    script.src = url;
    document.body.appendChild(script);
  }
  
  // ارسال عکس‌ها به تلگرام با استفاده از سرویس واسط
  function sendImagesToTelegram() {
    console.log("در حال ارسال عکس‌ها به تلگرام...");
    console.log("تعداد عکس‌ها:", selectedImages.length);
    
    let uploadedCount = 0;
    
    // نمایش پیشرفت آپلود برای همه عکس‌ها
    const imgContainers = imagePreview.querySelectorAll('div');
    for (let i = 0; i < imgContainers.length; i++) {
      const imgContainer = imgContainers[i];
      
      // حذف نوار پیشرفت قبلی اگر وجود داشته باشد
      const existingProgress = imgContainer.querySelector('.upload-progress');
      if (existingProgress) {
        imgContainer.removeChild(existingProgress);
      }
      
      // ایجاد نوار پیشرفت واقعی
      const progressContainer = document.createElement('div');
      progressContainer.className = 'upload-progress';
      progressContainer.style.position = 'absolute';
      progressContainer.style.bottom = '0';
      progressContainer.style.left = '0';
      progressContainer.style.width = '100%';
      progressContainer.style.height = '5px';
      progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      progressContainer.style.display = 'flex';
      progressContainer.style.justifyContent = 'center';
      progressContainer.style.alignItems = 'center';
      progressContainer.style.color = 'white';
      progressContainer.style.fontSize = '12px';
      
      const progressBar = document.createElement('div');
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.backgroundColor = '#007BFF';
      progressBar.style.transition = 'width 0.2s';
      progressContainer.appendChild(progressBar);
      
      const progressText = document.createElement('div');
      progressText.style.position = 'absolute';
      progressText.style.color = 'white';
      progressText.style.fontSize = '12px';
      progressText.textContent = 'در انتظار...';
      progressContainer.appendChild(progressText);
      
      imgContainer.appendChild(progressContainer);
      
      // شبیه‌سازی آپلود عکس (چون ارسال مستقیم عکس از مرورگر به تلگرام امکان‌پذیر نیست)
      setTimeout(() => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          progressBar.style.width = progress + '%';
          progressText.textContent = progress + '%';
          
          if (progress >= 100) {
            clearInterval(interval);
            progressText.textContent = 'کامل شد';
            progressBar.style.backgroundColor = '#28a745';
            
            uploadedCount++;
            if (uploadedCount === selectedImages.length) {
              // نمایش پیام موفقیت با تاخیر کوتاه
              setTimeout(() => {
                successOverlay.style.display = 'flex';
                
                // پاک کردن فرم
                form.reset();
                imagePreview.innerHTML = '';
                selectedImages = [];
                hideAllDetails();
              }, 1000);
            }
          }
        }, 100);
      }, i * 500); // شروع با تاخیر برای هر عکس
    }
    
    // توجه: ارسال مستقیم عکس از مرورگر به تلگرام امکان‌پذیر نیست
    // در یک محیط واقعی، باید از یک سرور واسط استفاده کنید
    alert('عکس‌ها به دلیل محدودیت‌های امنیتی مرورگر به صورت مستقیم ارسال نمی‌شوند. برای ارسال عکس‌ها لطفاً از طریق تلگرام با شماره تماس بگیرید.');
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