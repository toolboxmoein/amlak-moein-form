// تنظیمات اولیه
document.addEventListener('DOMContentLoaded', function() {
  // نمایش بخش‌های مختلف فرم بر اساس نوع ملک
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  
  // بخش‌های مختلف فرم
  const apartmentDetails = document.getElementById('apartmentDetails');
  const villaDetails = document.getElementById('villaDetails');
  const landDetails = document.getElementById('landDetails');
  const commercialDetails = document.getElementById('commercialDetails');
  const oldDetails = document.getElementById('oldDetails');
  const presaleTypeSection = document.getElementById('presaleTypeSection');
  const presaleApartmentDetails = document.getElementById('presaleApartmentDetails');
  const presaleVillaDetails = document.getElementById('presaleVillaDetails');
  const imageUploadSection = document.getElementById('imageUploadSection');
  
  // پنهان کردن همه بخش‌ها در ابتدا
  function hideAllSections() {
    apartmentDetails.classList.add('hidden');
    villaDetails.classList.add('hidden');
    landDetails.classList.add('hidden');
    commercialDetails.classList.add('hidden');
    oldDetails.classList.add('hidden');
    presaleTypeSection.classList.add('hidden');
    presaleApartmentDetails.classList.add('hidden');
    presaleVillaDetails.classList.add('hidden');
    imageUploadSection.classList.add('hidden');
  }
  
  // نمایش بخش مربوط به نوع ملک انتخاب شده
  propertyTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      hideAllSections();
      document.getElementById('typeError').classList.add('hidden');
      
      // نمایش بخش آپلود عکس
      imageUploadSection.classList.remove('hidden');
      
      switch(this.value) {
        case 'آپارتمان':
          apartmentDetails.classList.remove('hidden');
          break;
        case 'ویلا':
          villaDetails.classList.remove('hidden');
          break;
        case 'زمین':
          landDetails.classList.remove('hidden');
          break;
        case 'تجاری':
          commercialDetails.classList.remove('hidden');
          break;
        case 'کلنگی':
          oldDetails.classList.remove('hidden');
          break;
        case 'پیش‌فروش':
          presaleTypeSection.classList.remove('hidden');
          break;
      }
    });
  });
  
  // نمایش بخش مربوط به نوع پیش‌فروش انتخاب شده
  presaleTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      presaleApartmentDetails.classList.add('hidden');
      presaleVillaDetails.classList.add('hidden');
      
      switch(this.value) {
        case 'آپارتمان':
          presaleApartmentDetails.classList.remove('hidden');
          break;
        case 'ویلا':
          presaleVillaDetails.classList.remove('hidden');
          break;
      }
    });
  });
  
  // منوی همبرگری
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  
  hamburgerMenu.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });
  
  menuClose.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });
  
  // دکمه‌های تأیید پاک کردن فرم
  const resetBtn = document.getElementById('resetBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  
  resetBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'flex';
  });
  
  confirmYesBtn.addEventListener('click', function() {
    document.getElementById('propertyForm').reset();
    hideAllSections();
    confirmOverlay.style.display = 'none';
    
    // پاک کردن پیش‌نمایش عکس‌ها
    document.getElementById('imagePreview').innerHTML = '';
    uploadedImages = [];
  });
  
  confirmNoBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'none';
  });
  
  // بستن پیام موفقیت
  document.getElementById('closeSuccessBtn').addEventListener('click', function() {
    document.getElementById('successOverlay').style.display = 'none';
  });
  
  // بستن پیام خطای عکس
  document.getElementById('closeImageErrorBtn').addEventListener('click', function() {
    document.getElementById('imageErrorOverlay').style.display = 'none';
  });
  
  // آپلود عکس
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressBar = uploadProgress.querySelector('.progress-bar');
  let uploadedImages = [];
  
  imageUpload.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    // بررسی تعداد عکس‌ها
    if (files.length + uploadedImages.length > 3) {
      document.getElementById('imageErrorOverlay').style.display = 'flex';
      return;
    }
    
    // نمایش نوار پیشرفت
    uploadProgress.classList.remove('hidden');
    
    // شبیه‌سازی پیشرفت آپلود
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // پس از تکمیل آپلود
        setTimeout(() => {
          uploadProgress.classList.add('hidden');
          progressBar.style.width = '0%';
          progressBar.setAttribute('aria-valuenow', 0);
          
          // نمایش پیش‌نمایش عکس‌ها
          files.forEach(file => {
            if (file.type.match('image.*') && file.size <= 5 * 1024 * 1024) {
              const reader = new FileReader();
              
              reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                imagePreview.appendChild(img);
                uploadedImages.push(file);
              };
              
              reader.readAsDataURL(file);
            }
          });
        }, 500);
      }
    }, 100);
  });
  
  // اعتبارسنجی فیلدهای فرم
  function validateForm() {
    let isValid = true;
    
    // اعتبارسنجی نام و نام خانوادگی
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    
    if (!firstName.value.trim()) {
      firstNameError.textContent = 'لطفاً نام خود را وارد کنید';
      firstNameError.classList.remove('hidden');
      firstName.classList.add('error-field');
      isValid = false;
    } else {
      firstNameError.classList.add('hidden');
      firstName.classList.remove('error-field');
    }
    
    if (!lastName.value.trim()) {
      lastNameError.textContent = 'لطفاً نام خانوادگی خود را وارد کنید';
      lastNameError.classList.remove('hidden');
      lastName.classList.add('error-field');
      isValid = false;
    } else {
      lastNameError.classList.add('hidden');
      lastName.classList.remove('error-field');
    }
    
    // اعتبارسنجی شماره تماس
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phoneRegex = /^09\d{9}$/;
    
    if (!phoneRegex.test(phone.value.trim())) {
      phoneError.textContent = 'لطفاً یک شماره موبایل معتبر 11 رقمی وارد کنید';
      phoneError.classList.remove('hidden');
      phone.classList.add('error-field');
      isValid = false;
    } else {
      phoneError.classList.add('hidden');
      phone.classList.remove('error-field');
    }
    
    // اعتبارسنجی شماره تماس دیگر
    const altPhone = document.getElementById('altPhone');
    const altPhoneError = document.getElementById('altPhoneError');
    
    if (altPhone.value.trim() && !altPhone.value.trim().startsWith('0')) {
      altPhoneError.textContent = 'شماره تماس باید با صفر شروع شود';
      altPhoneError.classList.remove('hidden');
      altPhone.classList.add('error-field');
      isValid = false;
    } else if (altPhone.value.trim() && altPhone.value.trim().length !== 11) {
      altPhoneError.textContent = 'شماره تماس باید 11 رقم باشد';
      altPhoneError.classList.remove('hidden');
      altPhone.classList.add('error-field');
      isValid = false;
    } else {
      altPhoneError.classList.add('hidden');
      altPhone.classList.remove('error-field');
    }
    
    // اعتبارسنجی نوع ملک
    const propertyType = document.querySelector('input[name="propertyType"]:checked');
    const typeError = document.getElementById('typeError');
    
    if (!propertyType) {
      typeError.classList.remove('hidden');
      isValid = false;
    } else {
      typeError.classList.add('hidden');
      
      // اعتبارسنجی وضعیت سند
      const documentChecked = document.querySelector('input[name="document"]:checked');
      let documentError;
      
      switch(propertyType.value) {
        case 'آپارتمان':
          documentError = document.getElementById('documentError-apartment');
          break;
        case 'ویلا':
          documentError = document.getElementById('documentError-villa');
          break;
        case 'زمین':
          documentError = document.getElementById('documentError-land');
          break;
        case 'تجاری':
          documentError = document.getElementById('documentError-commercial');
          break;
        case 'کلنگی':
          documentError = document.getElementById('documentError-old');
          break;
        case 'پیش‌فروش':
          const presaleType = document.querySelector('input[name="presaleType"]:checked');
          if (presaleType) {
            if (presaleType.value === 'آپارتمان') {
              documentError = document.getElementById('documentError-presale-apartment');
            } else {
              documentError = document.getElementById('documentError-presale-villa');
            }
          }
          break;
      }
      
      if (documentError && !documentChecked) {
        documentError.classList.remove('hidden');
        isValid = false;
      } else if (documentError) {
        documentError.classList.add('hidden');
      }
      
      // اعتبارسنجی شرایط فروش
      let saleConditions;
      let saleConditionError;
      
      switch(propertyType.value) {
        case 'آپارتمان':
          saleConditions = document.querySelectorAll('#apartmentDetails input[name="saleConditions"]:checked');
          saleConditionError = document.getElementById('saleConditionError-apartment');
          break;
        case 'ویلا':
          saleConditions = document.querySelectorAll('#villaDetails input[name="saleConditions"]:checked');
          saleConditionError = document.getElementById('saleConditionError-villa');
          break;
        case 'زمین':
          saleConditions = document.querySelectorAll('#landDetails input[name="saleConditions"]:checked');
          saleConditionError = document.getElementById('saleConditionError-land');
          break;
        case 'تجاری':
          saleConditions = document.querySelectorAll('#commercialDetails input[name="saleConditions"]:checked');
          saleConditionError = document.getElementById('saleConditionError-commercial');
          break;
        case 'کلنگی':
          saleConditions = document.querySelectorAll('#oldDetails input[name="saleConditions"]:checked');
          saleConditionError = document.getElementById('saleConditionError-old');
          break;
        case 'پیش‌فروش':
          const presaleType = document.querySelector('input[name="presaleType"]:checked');
          if (presaleType) {
            if (presaleType.value === 'آپارتمان') {
              saleConditions = document.querySelectorAll('#presaleApartmentDetails input[name="saleConditions"]:checked');
              saleConditionError = document.getElementById('saleConditionError-presale-apartment');
            } else {
              saleConditions = document.querySelectorAll('#presaleVillaDetails input[name="saleConditions"]:checked');
              saleConditionError = document.getElementById('saleConditionError-presale-villa');
            }
          }
          break;
      }
      
      if (saleConditionError && (!saleConditions || saleConditions.length === 0)) {
        saleConditionError.classList.remove('hidden');
        isValid = false;
      } else if (saleConditionError) {
        saleConditionError.classList.add('hidden');
      }
    }
    
    return isValid;
  }
  
  // محاسبه خودکار قیمت کلی برای آپارتمان
  const unitAreaApartment = document.getElementById('unitArea-apartment');
  const pricePerMeterApartment = document.getElementById('pricePerMeter-apartment');
  const totalPriceApartment = document.getElementById('totalPrice-apartment');
  
  function calculateTotalPriceApartment() {
    const area = parseFloat(unitAreaApartment.value.replace(/,/g, '')) || 0;
    const pricePerMeter = parseFloat(pricePerMeterApartment.value.replace(/,/g, '')) || 0;
    
    if (area > 0 && pricePerMeter > 0) {
      const totalPrice = area * pricePerMeter;
      totalPriceApartment.value = totalPrice.toLocaleString();
    }
  }
  
  unitAreaApartment.addEventListener('input', calculateTotalPriceApartment);
  pricePerMeterApartment.addEventListener('input', calculateTotalPriceApartment);
  
  // محاسبه خودکار قیمت کلی برای زمین
  const landAreaLand = document.getElementById('landArea-land');
  const pricePerMeterLand = document.getElementById('pricePerMeter-land');
  const totalPriceLand = document.getElementById('totalPrice-land');
  
  function calculateTotalPriceLand() {
    const area = parseFloat(landAreaLand.value.replace(/,/g, '')) || 0;
    const pricePerMeter = parseFloat(pricePerMeterLand.value.replace(/,/g, '')) || 0;
    
    if (area > 0 && pricePerMeter > 0) {
      const totalPrice = area * pricePerMeter;
      totalPriceLand.value = totalPrice.toLocaleString();
    }
  }
  
  landAreaLand.addEventListener('input', calculateTotalPriceLand);
  pricePerMeterLand.addEventListener('input', calculateTotalPriceLand);
  
  // محاسبه خودکار قیمت کلی برای تجاری
  const shopArea = document.getElementById('shopArea');
  const pricePerMeterCommercial = document.getElementById('pricePerMeter-commercial');
  const totalPriceCommercial = document.getElementById('totalPrice-commercial');
  
  function calculateTotalPriceCommercial() {
    const area = parseFloat(shopArea.value.replace(/,/g, '')) || 0;
    const pricePerMeter = parseFloat(pricePerMeterCommercial.value.replace(/,/g, '')) || 0;
    
    if (area > 0 && pricePerMeter > 0) {
      const totalPrice = area * pricePerMeter;
      totalPriceCommercial.value = totalPrice.toLocaleString();
    }
  }
  
  shopArea.addEventListener('input', calculateTotalPriceCommercial);
  pricePerMeterCommercial.addEventListener('input', calculateTotalPriceCommercial);
  
  // محاسبه خودکار قیمت کلی برای کلنگی
  const landAreaOld = document.getElementById('landArea-old');
  const pricePerMeterOld = document.getElementById('pricePerMeter-old');
  const totalPriceOld = document.getElementById('totalPrice-old');
  
  function calculateTotalPriceOld() {
    const area = parseFloat(landAreaOld.value.replace(/,/g, '')) || 0;
    const pricePerMeter = parseFloat(pricePerMeterOld.value.replace(/,/g, '')) || 0;
    
    if (area > 0 && pricePerMeter > 0) {
      const totalPrice = area * pricePerMeter;
      totalPriceOld.value = totalPrice.toLocaleString();
    }
  }
  
  landAreaOld.addEventListener('input', calculateTotalPriceOld);
  pricePerMeterOld.addEventListener('input', calculateTotalPriceOld);
  
  // محاسبه خودکار قیمت کلی برای پیش‌فروش آپارتمان
  const unitAreaPresaleApartment = document.getElementById('unitArea-presale-apartment');
  const pricePerMeterPresaleApartment = document.getElementById('pricePerMeter-presale-apartment');
  const totalPricePresaleApartment = document.getElementById('totalPrice-presale-apartment');
  
  function calculateTotalPricePresaleApartment() {
    const area = parseFloat(unitAreaPresaleApartment.value.replace(/,/g, '')) || 0;
    const pricePerMeter = parseFloat(pricePerMeterPresaleApartment.value.replace(/,/g, '')) || 0;
    
    if (area > 0 && pricePerMeter > 0) {
      const totalPrice = area * pricePerMeter;
      totalPricePresaleApartment.value = totalPrice.toLocaleString();
    }
  }
  
  unitAreaPresaleApartment.addEventListener('input', calculateTotalPricePresaleApartment);
  pricePerMeterPresaleApartment.addEventListener('input', calculateTotalPricePresaleApartment);
  
  // فرمت‌دهی خودکار قیمت‌ها
  const priceInputs = document.querySelectorAll('.price-input');
  
  priceInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      // حذف همه کاراکترهای غیر عددی
      let value = this.value.replace(/\D/g, '');
      
      // فرمت‌دهی با کاما
      if (value) {
        this.value = parseInt(value).toLocaleString();
      }
    });
  });
  
  // فقط اعداد در فیلدهای عددی
  const numericInputs = document.querySelectorAll('.numeric-only');
  
  numericInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '');
    });
  });
  
  // فقط حروف فارسی در فیلدهای متنی فارسی
  const persianInputs = document.querySelectorAll('.persian-only');
  
  persianInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      // اجازه به حروف فارسی، فاصله و برخی علائم نگارشی
      this.value = this.value.replace(/[a-zA-Z0-9`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    });
  });
  
  // ارسال فرم
  document.getElementById('propertyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // اعتبارسنجی فرم
    if (!validateForm()) {
      return;
    }
    
    // نمایش پیام در حال ارسال
    document.getElementById('sendingOverlay').style.display = 'flex';
    
    // جمع‌آوری اطلاعات فرم
    const formData = collectFormData();
    
    // ارسال اطلاعات به تلگرام
    sendToTelegram(formData)
      .then(response => {
        // پنهان کردن پیام در حال ارسال
        document.getElementById('sendingOverlay').style.display = 'none';
        
        // نمایش پیام موفقیت
        document.getElementById('successOverlay').style.display = 'flex';
        
        // پخش صدای موفقیت
        document.getElementById('successSound').play();
        
        // ریست کردن فرم
        document.getElementById('propertyForm').reset();
        hideAllSections();
        document.getElementById('imagePreview').innerHTML = '';
        uploadedImages = [];
      })
      .catch(error => {
        console.error('Error:', error);
        alert('خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
        document.getElementById('sendingOverlay').style.display = 'none';
      });
  });
  
  // جمع‌آوری اطلاعات فرم
  function collectFormData() {
    const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
    let formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      phone: document.getElementById('phone').value,
      altPhone: document.getElementById('altPhone').value,
      propertyType: propertyType
    };
    
    // اطلاعات مربوط به نوع ملک
    switch(propertyType) {
      case 'آپارتمان':
        formData = {
          ...formData,
          landArea: document.getElementById('landArea-apartment').value,
          unitArea: document.getElementById('unitArea-apartment').value,
          roomCount: document.getElementById('roomCount-apartment').value,
          buildYear: document.getElementById('buildYear-apartment').value,
          kitchen: Array.from(document.querySelectorAll('#apartmentDetails input[name="kitchen-apartment"]:checked')).map(el => el.value).join(', '),
          facilities: Array.from(document.querySelectorAll('#apartmentDetails input[name="facilities-apartment"]:checked')).map(el => el.value).join(', '),
          otherFacilities: document.getElementById('otherFacilities-apartment').value,
          amenities: Array.from(document.querySelectorAll('#apartmentDetails input[name="amenities-apartment"]:checked')).map(el => el.value).join(', '),
          otherAmenities: document.getElementById('otherAmenities-apartment').value,
          commonAreas: Array.from(document.querySelectorAll('#apartmentDetails input[name="commonAreas-apartment"]:checked')).map(el => el.value).join(', '),
          otherCommonAreas: document.getElementById('otherCommonAreas-apartment').value,
          otherDetails: document.getElementById('otherDetails-apartment').value,
          document: document.querySelector('#apartmentDetails input[name="document"]:checked')?.value,
          pricePerMeter: document.getElementById('pricePerMeter-apartment').value,
          totalPrice: document.getElementById('totalPrice-apartment').value,
          saleConditions: Array.from(document.querySelectorAll('#apartmentDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
          saleConditionDetails: document.getElementById('saleConditionDetails-apartment').value,
          address: document.getElementById('address-apartment').value
        };
        break;
        
      case 'ویلا':
        formData = {
          ...formData,
          landArea: document.getElementById('landArea-villa').value,
          buildingArea: document.getElementById('buildingArea-villa').value,
          roomCount: document.getElementById('roomCount-villa').value,
          buildYear: document.getElementById('buildYear-villa').value,
          kitchen: Array.from(document.querySelectorAll('#villaDetails input[name="kitchen-villa"]:checked')).map(el => el.value).join(', '),
          facilities: Array.from(document.querySelectorAll('#villaDetails input[name="facilities-villa"]:checked')).map(el => el.value).join(', '),
          otherFacilities: document.getElementById('otherFacilities-villa').value,
          amenities: Array.from(document.querySelectorAll('#villaDetails input[name="amenities-villa"]:checked')).map(el => el.value).join(', '),
          otherAmenities: document.getElementById('otherAmenities-villa').value,
          otherDetails: document.getElementById('otherDetails-villa').value,
          document: document.querySelector('#villaDetails input[name="document"]:checked')?.value,
          price: document.getElementById('price-villa').value,
          saleConditions: Array.from(document.querySelectorAll('#villaDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
          saleConditionDetails: document.getElementById('saleConditionDetails-villa').value,
          address: document.getElementById('address-villa').value
        };
        break;
        
      case 'زمین':
        formData = {
          ...formData,
          landArea: document.getElementById('landArea-land').value,
          landUsage: document.getElementById('landUsage').value,
          landWidth: document.getElementById('landWidth').value,
          landDepth: document.getElementById('landDepth').value,
          alleyWidth: document.getElementById('alleyWidth').value,
          enclosed: document.querySelector('input[name="enclosed"]:checked')?.value,
          otherDetails: document.getElementById('otherDetails-land').value,
          document: document.querySelector('#landDetails input[name="document"]:checked')?.value,
          pricePerMeter: document.getElementById('pricePerMeter-land').value,
          totalPrice: document.getElementById('totalPrice-land').value,
          saleConditions: Array.from(document.querySelectorAll('#landDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
          saleConditionDetails: document.getElementById('saleConditionDetails-land').value,
          address: document.getElementById('address-land').value
        };
        break;
        
      case 'تجاری':
        formData = {
          ...formData,
          shopArea: document.getElementById('shopArea').value,
          shopHeight: document.getElementById('shopHeight').value,
          shopWidth: document.getElementById('shopWidth').value,
          shopDetails: document.getElementById('shopDetails').value,
          otherDetails: document.getElementById('otherDetails-commercial').value,
          document: document.querySelector('#commercialDetails input[name="document"]:checked')?.value,
          pricePerMeter: document.getElementById('pricePerMeter-commercial').value,
          totalPrice: document.getElementById('totalPrice-commercial').value,
          saleConditions: Array.from(document.querySelectorAll('#commercialDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
          saleConditionDetails: document.getElementById('saleConditionDetails-commercial').value,
          address: document.getElementById('address-commercial').value
        };
        break;
        
      case 'کلنگی':
        formData = {
          ...formData,
          landArea: document.getElementById('landArea-old').value,
          buildingArea: document.getElementById('buildingArea-old').value,
          landWidth: document.getElementById('landWidth-old').value,
          landDepth: document.getElementById('landDepth-old').value,
          livability: document.querySelector('input[name="livability"]:checked')?.value,
          utilities: Array.from(document.querySelectorAll('input[name="utilities"]:checked')).map(el => el.value).join(', '),
          amenities: document.getElementById('amenities-old').value,
          document: document.querySelector('#oldDetails input[name="document"]:checked')?.value,
          pricePerMeter: document.getElementById('pricePerMeter-old').value,
          totalPrice: document.getElementById('totalPrice-old').value,
          saleConditions: Array.from(document.querySelectorAll('#oldDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
          saleConditionDetails: document.getElementById('saleConditionDetails-old').value,
          address: document.getElementById('address-old').value
        };
        break;
        
      case 'پیش‌فروش':
        const presaleType = document.querySelector('input[name="presaleType"]:checked')?.value;
        formData.presaleType = presaleType;
        formData.projectProgress = document.getElementById('projectProgress').value;
        
        if (presaleType === 'آپارتمان') {
          formData = {
            ...formData,
            landArea: document.getElementById('landArea-presale-apartment').value,
            unitArea: document.getElementById('unitArea-presale-apartment').value,
            roomCount: document.getElementById('roomCount-presale-apartment').value,
            floorCount: document.getElementById('floorCount-presale-apartment').value,
            floorNumber: document.getElementById('floorNumber-presale-apartment').value,
            unitsPerFloor: document.getElementById('unitsPerFloor-presale-apartment').value,
            moreDetails: document.getElementById('moreDetails-presale-apartment').value,
            kitchen: Array.from(document.querySelectorAll('#presaleApartmentDetails input[name="kitchen-presale-apartment"]:checked')).map(el => el.value).join(', '),
            otherDetails: document.getElementById('otherDetails-presale-apartment').value,
            document: document.querySelector('#presaleApartmentDetails input[name="document"]:checked')?.value,
            pricePerMeter: document.getElementById('pricePerMeter-presale-apartment').value,
            totalPrice: document.getElementById('totalPrice-presale-apartment').value,
            saleConditions: Array.from(document.querySelectorAll('#presaleApartmentDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
            saleConditionDetails: document.getElementById('saleConditionDetails-presale-apartment').value,
            address: document.getElementById('address-presale-apartment').value
          };
        } else if (presaleType === 'ویلا') {
          formData = {
            ...formData,
            landArea: document.getElementById('landArea-presale-villa').value,
            buildingArea: document.getElementById('buildingArea-presale-villa').value,
            roomCount: document.getElementById('roomCount-presale-villa').value,
            floorCount: document.getElementById('floorCount-presale-villa').value,
            kitchen: Array.from(document.querySelectorAll('#presaleVillaDetails input[name="kitchen-presale-villa"]:checked')).map(el => el.value).join(', '),
            otherDetails: document.getElementById('otherDetails-presale-villa').value,
            document: document.querySelector('#presaleVillaDetails input[name="document"]:checked')?.value,
            price: document.getElementById('price-presale-villa').value,
            saleConditions: Array.from(document.querySelectorAll('#presaleVillaDetails input[name="saleConditions"]:checked')).map(el => el.value).join(', '),
            saleConditionDetails: document.getElementById('saleConditionDetails-presale-villa').value,
            address: document.getElementById('address-presale-villa').value
          };
        }
        break;
    }
    
    return formData;
  }
  
  // ارسال اطلاعات به تلگرام
  function sendToTelegram(data) {
    // تبدیل اطلاعات به متن برای ارسال به تلگرام
    let message = `🏠 *اطلاعات ملک جدید*\n\n`;
    message += `👤 *مشخصات مالک*\n`;
    message += `نام و نام خانوادگی: ${data.firstName} ${data.lastName}\n`;
    message += `شماره تماس: ${data.phone}\n`;
    if (data.altPhone) {
      message += `شماره تماس دیگر: ${data.altPhone}\n`;
    }
    
    message += `\n🏢 *نوع ملک*: ${data.propertyType}\n`;
    
    // اطلاعات مربوط به نوع ملک
    switch(data.propertyType) {
      case 'آپارتمان':
        message += `\n📋 *مشخصات آپارتمان*\n`;
        if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
        if (data.unitArea) message += `متراژ واحد: ${data.unitArea} متر\n`;
        if (data.roomCount) message += `تعداد اتاق: ${data.roomCount}\n`;
        if (data.buildYear) message += `سال ساخت: ${data.buildYear}\n`;
        if (data.kitchen) message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
        if (data.facilities) message += `تاسیسات: ${data.facilities}\n`;
        if (data.otherFacilities) message += `سایر تاسیسات: ${data.otherFacilities}\n`;
        if (data.amenities) message += `امکانات: ${data.amenities}\n`;
        if (data.otherAmenities) message += `سایر امکانات: ${data.otherAmenities}\n`;
        if (data.commonAreas) message += `مشاعات: ${data.commonAreas}\n`;
        if (data.otherCommonAreas) message += `سایر مشاعات: ${data.otherCommonAreas}\n`;
        if (data.otherDetails) message += `سایر توضیحات: ${data.otherDetails}\n`;
        if (data.document) message += `وضعیت سند: ${data.document}\n`;
        message += `\n💰 *قیمت*\n`;
        if (data.pricePerMeter) message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
        if (data.totalPrice) message += `قیمت کلی: ${data.totalPrice} تومان\n`;
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
        
      case 'ویلا':
        message += `\n📋 *مشخصات ویلا*\n`;
        if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
        if (data.buildingArea) message += `متراژ بنا: ${data.buildingArea} متر\n`;
        if (data.roomCount) message += `تعداد اتاق: ${data.roomCount}\n`;
        if (data.buildYear) message += `سال ساخت: ${data.buildYear}\n`;
        if (data.kitchen) message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
        if (data.facilities) message += `تاسیسات: ${data.facilities}\n`;
        if (data.otherFacilities) message += `سایر تاسیسات: ${data.otherFacilities}\n`;
        if (data.amenities) message += `امکانات: ${data.amenities}\n`;
        if (data.otherAmenities) message += `سایر امکانات: ${data.otherAmenities}\n`;
        if (data.otherDetails) message += `سایر توضیحات: ${data.otherDetails}\n`;
        if (data.document) message += `وضعیت سند: ${data.document}\n`;
        message += `\n💰 *قیمت*\n`;
        if (data.price) message += `قیمت کلی: ${data.price} تومان\n`;
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
        
      case 'زمین':
        message += `\n📋 *مشخصات زمین*\n`;
        if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
        if (data.landUsage) message += `کاربری: ${data.landUsage}\n`;
        if (data.landWidth) message += `بَر زمین: ${data.landWidth} متر\n`;
        if (data.landDepth) message += `عمق زمین: ${data.landDepth} متر\n`;
        if (data.alleyWidth) message += `عرض کوچه: ${data.alleyWidth} متر\n`;
        if (data.enclosed) message += `محصور: ${data.enclosed}\n`;
        if (data.otherDetails) message += `سایر توضیحات: ${data.otherDetails}\n`;
        if (data.document) message += `وضعیت سند: ${data.document}\n`;
        message += `\n💰 *قیمت*\n`;
        if (data.pricePerMeter) message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
        if (data.totalPrice) message += `قیمت کلی: ${data.totalPrice} تومان\n`;
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
        
      case 'تجاری':
        message += `\n📋 *مشخصات تجاری / مغازه*\n`;
        if (data.shopArea) message += `متراژ مغازه: ${data.shopArea} متر\n`;
        if (data.shopHeight) message += `ارتفاع مغازه: ${data.shopHeight} متر\n`;
        if (data.shopWidth) message += `دهنه مغازه: ${data.shopWidth} متر\n`;
        if (data.shopDetails) message += `توضیحات شکل مغازه: ${data.shopDetails}\n`;
        if (data.otherDetails) message += `امکانات: ${data.otherDetails}\n`;
        if (data.document) message += `وضعیت سند: ${data.document}\n`;
        message += `\n💰 *قیمت*\n`;
        if (data.pricePerMeter) message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
        if (data.totalPrice) message += `قیمت کلی: ${data.totalPrice} تومان\n`;
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
        
      case 'کلنگی':
        message += `\n📋 *مشخصات کلنگی*\n`;
        if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
        if (data.buildingArea) message += `متراژ بنا: ${data.buildingArea} متر\n`;
        if (data.landWidth) message += `بَر زمین: ${data.landWidth} متر\n`;
        if (data.landDepth) message += `عمق زمین: ${data.landDepth} متر\n`;
        if (data.livability) message += `وضعیت سکونت: ${data.livability}\n`;
        if (data.utilities) message += `امتیازات: ${data.utilities}\n`;
        if (data.amenities) message += `امکانات: ${data.amenities}\n`;
        if (data.document) message += `وضعیت سند: ${data.document}\n`;
        message += `\n💰 *قیمت*\n`;
        if (data.pricePerMeter) message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
        if (data.totalPrice) message += `قیمت کلی: ${data.totalPrice} تومان\n`;
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
        
      case 'پیش‌فروش':
        message += `\n📋 *مشخصات پیش‌فروش ${data.presaleType}*\n`;
        if (data.projectProgress) message += `مرحله پروژه: ${data.projectProgress}\n`;
        
        if (data.presaleType === 'آپارتمان') {
          if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
          if (data.unitArea) message += `متراژ واحد: ${data.unitArea} متر\n`;
          if (data.roomCount) message += `تعداد اتاق: ${data.roomCount}\n`;
          if (data.floorCount) message += `تعداد طبقه: ${data.floorCount}\n`;
          if (data.floorNumber) message += `طبقه چندم: ${data.floorNumber}\n`;
          if (data.unitsPerFloor) message += `تعداد واحد در هر طبقه: ${data.unitsPerFloor}\n`;
          if (data.moreDetails) message += `توضیحات بیشتر: ${data.moreDetails}\n`;
          if (data.kitchen) message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
          if (data.otherDetails) message += `سایر توضیحات و امکانات: ${data.otherDetails}\n`;
          if (data.document) message += `وضعیت سند: ${data.document}\n`;
          message += `\n💰 *قیمت*\n`;
          if (data.pricePerMeter) message += `قیمت متری: ${data.pricePerMeter} تومان\n`;
          if (data.totalPrice) message += `قیمت کلی: ${data.totalPrice} تومان\n`;
        } else if (data.presaleType === 'ویلا') {
          if (data.landArea) message += `متراژ زمین: ${data.landArea} متر\n`;
          if (data.buildingArea) message += `متراژ بنا: ${data.buildingArea} متر\n`;
          if (data.roomCount) message += `تعداد اتاق: ${data.roomCount}\n`;
          if (data.floorCount) message += `تعداد طبقات: ${data.floorCount}\n`;
          if (data.kitchen) message += `مشخصات آشپزخانه: ${data.kitchen}\n`;
          if (data.otherDetails) message += `سایر توضیحات و امکانات: ${data.otherDetails}\n`;
          if (data.document) message += `وضعیت سند: ${data.document}\n`;
          message += `\n💰 *قیمت*\n`;
          if (data.price) message += `قیمت کلی: ${data.price} تومان\n`;
        }
        
        if (data.saleConditions) message += `شرایط فروش: ${data.saleConditions}\n`;
        if (data.saleConditionDetails) message += `توضیحات شرایط فروش: ${data.saleConditionDetails}\n`;
        if (data.address) message += `\n📍 *آدرس*: ${data.address}\n`;
        break;
    }
    
    // تنظیمات ارسال به تلگرام
    const botToken = '6915900612:AAFxQrOXdWXrYzaIaUdHvbXXXXXXXXXXXXX'; // توکن بات را وارد کنید
    const chatId = '-1001977618987'; // آیدی چت را وارد کنید
    
    // ارسال پیام به تلگرام
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const params = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    };
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    .then(response => response.json());
  }
});