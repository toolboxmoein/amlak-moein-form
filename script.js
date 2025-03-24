document.addEventListener('DOMContentLoaded', function() {
  // تنظیمات تلگرام
  const telegramBotToken = '8105224277:AAF0dfXlg3EMCt8L-R4Q1Fe70nb3EtKiFWA';
  const yourTelegramId = '@Mohsenmoein7'; // آیدی تلگرام شما
  
  // متغیرهای سراسری
  let uploadedImages = [];
  
  // تولید کد منحصر به فرد برای هر فرم ارسالی
  function generateFormCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let code = '';
    
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    
    return `AM-${code}`;
  }
  
  // تنظیمات منوی همبرگری
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  
  // نمایش منوی همبرگری
  hamburgerMenu.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });
  
  // بستن منوی همبرگری
  menuClose.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });
  
  // پنجره‌های تأیید و موفقیت
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  const successOverlay = document.getElementById('successOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  
  // بستن پنجره موفقیت
  closeSuccessBtn.addEventListener('click', function() {
    successOverlay.style.display = 'none';
  });
  
  // دکمه پاک کردن اطلاعات
  document.getElementById('resetBtn').addEventListener('click', function() {
    confirmOverlay.style.display = 'flex';
  });
  
  // تأیید پاک کردن اطلاعات
  confirmYesBtn.addEventListener('click', function() {
    document.getElementById('propertyForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    uploadedImages = [];
    
    // مخفی کردن بخش‌های اضافی
    document.getElementById('apartmentDetails').classList.add('hidden');
    document.getElementById('villaDetails').classList.add('hidden');
    document.getElementById('landDetails').classList.add('hidden');
    document.getElementById('commercialDetails').classList.add('hidden');
    document.getElementById('oldDetails').classList.add('hidden');
    document.getElementById('presaleTypeSection').classList.add('hidden');
    document.getElementById('presaleApartmentDetails').classList.add('hidden');
    document.getElementById('presaleVillaDetails').classList.add('hidden');
    document.getElementById('commonDetails').classList.add('hidden');
    document.getElementById('imageUploadSection').classList.add('hidden');
    document.getElementById('priceSection-meter').classList.add('hidden');
    document.getElementById('priceSection-normal').classList.add('hidden');
    
    // مخفی کردن پیام‌های خطا
    const errorMessages = document.querySelectorAll('.error');
    errorMessages.forEach(function(error) {
      error.classList.add('hidden');
    });
    
    // حذف کلاس خطا از فیلدها
    const errorFields = document.querySelectorAll('.error-field');
    errorFields.forEach(function(field) {
      field.classList.remove('error-field');
    });
    
    // بستن پنجره تأیید
    confirmOverlay.style.display = 'none';
  });
  
  // لغو پاک کردن اطلاعات
  confirmNoBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'none';
  });
  
  // محدود کردن ورودی نام و نام خانوادگی به فارسی
  document.getElementById('firstName').addEventListener('input', function() {
    if (!/^[\u0600-\u06FF\s]*$/.test(this.value)) {
      document.getElementById('firstNameError').classList.remove('hidden');
      this.classList.add('error-field');
      this.value = this.value.replace(/[^\u0600-\u06FF\s]/g, '');
    } else {
      document.getElementById('firstNameError').classList.add('hidden');
      this.classList.remove('error-field');
    }
  });

  document.getElementById('lastName').addEventListener('input', function() {
    if (!/^[\u0600-\u06FF\s]*$/.test(this.value)) {
      document.getElementById('lastNameError').classList.remove('hidden');
      this.classList.add('error-field');
      this.value = this.value.replace(/[^\u0600-\u06FF\s]/g, '');
    } else {
      document.getElementById('lastNameError').classList.add('hidden');
      this.classList.remove('error-field');
    }
  });

  // محدود کردن ورودی شماره تماس به عدد و حداکثر 11 رقم
  document.getElementById('phone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 11);
    if (this.value.length !== 11 && this.value.length > 0) {
      document.getElementById('phoneError').classList.remove('hidden');
      this.classList.add('error-field');
    } else {
      document.getElementById('phoneError').classList.add('hidden');
      this.classList.remove('error-field');
    }
  });

  // محدود کردن ورودی شماره تماس دیگر به عدد
  document.getElementById('altPhone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    if (this.value && isNaN(this.value)) {
      document.getElementById('altPhoneError').classList.remove('hidden');
      this.classList.add('error-field');
    } else {
      document.getElementById('altPhoneError').classList.add('hidden');
      this.classList.remove('error-field');
    }
  });

  // نمایش بخش اطلاعات آپارتمان/ویلا/زمین/تجاری/کلنگی و آپلود عکس در صورت انتخاب نوع ملک
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  propertyTypeRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      updateFormVisibility();
      
      // اگر پیش‌فروش انتخاب شده، نمایش بخش نوع پیش‌فروش
      if (this.id === 'presale') {
        document.getElementById('presaleTypeSection').classList.remove('hidden');
      } else {
        document.getElementById('presaleTypeSection').classList.add('hidden');
        document.getElementById('presaleApartmentDetails').classList.add('hidden');
        document.getElementById('presaleVillaDetails').classList.add('hidden');
      }
      
      // حذف کلاس خطا از radio button ها
      document.getElementById('typeError').classList.add('hidden');
    });
  });
  
  // نمایش بخش اطلاعات پیش‌فروش آپارتمان یا ویلا در صورت انتخاب نوع پیش‌فروش
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  presaleTypeRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.id === 'presale-apartment') {
        document.getElementById('presaleApartmentDetails').classList.remove('hidden');
        document.getElementById('presaleVillaDetails').classList.add('hidden');
      } else if (this.id === 'presale-villa') {
        document.getElementById('presaleApartmentDetails').classList.add('hidden');
        document.getElementById('presaleVillaDetails').classList.remove('hidden');
      }
    });
  });

  function updateFormVisibility() {
    const apartmentDetails = document.getElementById('apartmentDetails');
    const villaDetails = document.getElementById('villaDetails');
    const landDetails = document.getElementById('landDetails');
    const commercialDetails = document.getElementById('commercialDetails');
    const oldDetails = document.getElementById('oldDetails');
    const commonDetails = document.getElementById('commonDetails');
    const imageUploadSection = document.getElementById('imageUploadSection');
    const priceSectionMeter = document.getElementById('priceSection-meter');
    const priceSectionNormal = document.getElementById('priceSection-normal');
    
    // مخفی کردن همه بخش‌ها
    apartmentDetails.classList.add('hidden');
    villaDetails.classList.add('hidden');
    landDetails.classList.add('hidden');
    commercialDetails.classList.add('hidden');
    oldDetails.classList.add('hidden');
    commonDetails.classList.add('hidden');
    imageUploadSection.classList.add('hidden');
    priceSectionMeter.classList.add('hidden');
    priceSectionNormal.classList.add('hidden');
    
    // بررسی نوع ملک انتخاب شده
    const selectedPropertyType = document.querySelector('input[name="propertyType"]:checked');
    
    if (selectedPropertyType) {
      // نمایش بخش‌های مشترک و آپلود عکس
      commonDetails.classList.remove('hidden');
      imageUploadSection.classList.remove('hidden');
      
      // نمایش بخش مربوط به نوع ملک انتخاب شده
      if (selectedPropertyType.id === 'apartment') {
        apartmentDetails.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
      } else if (selectedPropertyType.id === 'villa') {
        villaDetails.classList.remove('hidden');
        priceSectionNormal.classList.remove('hidden');
      } else if (selectedPropertyType.id === 'land') {
        landDetails.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
      } else if (selectedPropertyType.id === 'commercial') {
        commercialDetails.classList.remove('hidden');
        priceSectionMeter.classList.remove('hidden');
      } else if (selectedPropertyType.id === 'old') {
        oldDetails.classList.remove('hidden');
        priceSectionNormal.classList.remove('hidden');
      } else if (selectedPropertyType.id === 'presale') {
        // برای پیش‌فروش، قیمت نرمال نمایش داده شود
        priceSectionNormal.classList.remove('hidden');
      } else {
        priceSectionNormal.classList.remove('hidden');
      }
    }
  }

  // محدودیت انتخاب یک گزینه در وضعیت سکونت کلنگی
  const livabilityRadios = document.querySelectorAll('input[name="livability"]');
  livabilityRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.checked) {
        livabilityRadios.forEach(function(r) {
          if (r !== radio) {
            r.checked = false;
          }
        });
      }
    });
  });

  // فرمت کردن اعداد به صورت سه رقم سه رقم
  function formatNumber(input) {
    // حذف کاراکترهای غیر عددی
    let value = input.value.replace(/\D/g, '');
    // فرمت کردن عدد به صورت سه رقم سه رقم
    if (value) {
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    input.value = value;
  }

  // اعمال فرمت سه رقم سه رقم برای فیلدهای عددی
  document.getElementById('price').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('pricePerMeter').addEventListener('input', function() {
    formatNumber(this);
    calculateTotalPrice();
  });

  document.getElementById('totalPrice').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landArea-apartment').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('unitArea-apartment').addEventListener('input', function() {
    formatNumber(this);
    calculateTotalPrice();
  });

  document.getElementById('landArea-villa').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('buildingArea-villa').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landArea-land').addEventListener('input', function() {
    formatNumber(this);
    calculateTotalPrice();
  });

  document.getElementById('landWidth').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landDepth').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('alleyWidth').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landArea-old').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('buildingArea-old').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landWidth-old').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('landDepth-old').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('shopArea').addEventListener('input', function() {
    formatNumber(this);
    calculateTotalPrice();
  });

  document.getElementById('shopHeight').addEventListener('input', function() {
    formatNumber(this);
  });

  document.getElementById('shopWidth').addEventListener('input', function() {
    formatNumber(this);
  });
  
  // فرمت‌دهی فیلدهای پیش‌فروش
  document.getElementById('landArea-presale-apartment').addEventListener('input', function() {
    formatNumber(this);
  });
  
  document.getElementById('unitArea-presale-apartment').addEventListener('input', function() {
    formatNumber(this);
  });
  
  document.getElementById('landArea-presale-villa').addEventListener('input', function() {
    formatNumber(this);
  });
  
  document.getElementById('buildingArea-presale-villa').addEventListener('input', function() {
    formatNumber(this);
  });

  // محاسبه قیمت کلی بر اساس قیمت متری
  function calculateTotalPrice() {
    const pricePerMeter = document.getElementById('pricePerMeter').value.replace(/,/g, '');
    if (!pricePerMeter) return;

    const selectedPropertyType = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedPropertyType) return;

    let area = 0;
    if (selectedPropertyType.id === 'apartment') {
      area = document.getElementById('unitArea-apartment').value.replace(/,/g, '');
    } else if (selectedPropertyType.id === 'land') {
      area = document.getElementById('landArea-land').value.replace(/,/g, '');
    } else if (selectedPropertyType.id === 'commercial') {
      area = document.getElementById('shopArea').value.replace(/,/g, '');
    }

    if (area && !isNaN(area) && !isNaN(pricePerMeter)) {
      const totalPrice = parseInt(area) * parseInt(pricePerMeter);
      document.getElementById('totalPrice').value = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  // محدودیت انتخاب یک گزینه در موقعیت زمین
  const positionRadios = document.querySelectorAll('input[name="position"]');
  positionRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.checked) {
        positionRadios.forEach(function(r) {
          if (r !== radio) {
            r.checked = false;
          }
        });
      }
    });
  });

  // آپلود عکس
  document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

  function handleImageUpload(e) {
    const files = e.target.files;
    const imagePreview = document.getElementById('imagePreview');
    
    if (!files.length) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.match('image.*')) continue;
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // نمایش پیش‌نمایش عکس
        const img = document.createElement('img');
        img.src = e.target.result;
        imagePreview.appendChild(img);
        
        // اضافه کردن به آرایه عکس‌های آپلود شده
        uploadedImages.push({
          file: file,
          dataUrl: e.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  }

  // ارسال عکس به تلگرام
  async function sendImageToTelegram(imageFile) {
    const formData = new FormData();
    formData.append('chat_id', yourTelegramId);
    formData.append('photo', imageFile);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('خطا در ارسال عکس:', error);
      return false;
    }
  }

  // ارسال پیام به تلگرام
  async function sendMessageToTelegram(message) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: yourTelegramId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      return false;
    }
  }

  // حذف کلاس خطا از همه فیلدها
  function clearAllErrors() {
    const errorFields = document.querySelectorAll('.error-field');
    errorFields.forEach(function(field) {
      field.classList.remove('error-field');
    });
    
    const errorMessages = document.querySelectorAll('.error');
    errorMessages.forEach(function(error) {
      error.classList.add('hidden');
    });
  }

  // اضافه کردن کلاس خطا به یک فیلد
  function markFieldAsError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('error-field');
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ارسال فرم
  document.getElementById('propertyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // پاک کردن همه خطاها
    clearAllErrors();

    // تولید کد منحصر به فرد برای این فرم
    const formCode = generateFormCode();

    // بررسی نام
    const firstName = document.getElementById('firstName').value.trim();
    const firstNameError = document.getElementById('firstNameError');
    if (!/^[\u0600-\u06FF\s]+$/.test(firstName)) {
      firstNameError.classList.remove('hidden');
      markFieldAsError('firstName');
      return;
    }

    // بررسی نام خانوادگی
    const lastName = document.getElementById('lastName').value.trim();
    const lastNameError = document.getElementById('lastNameError');
    if (!/^[\u0600-\u06FF\s]+$/.test(lastName)) {
      lastNameError.classList.remove('hidden');
      markFieldAsError('lastName');
      return;
    }

    // بررسی شماره تماس
    const phone = document.getElementById('phone').value.trim();
    const phoneError = document.getElementById('phoneError');
    if (phone.length !== 11) {
      phoneError.classList.remove('hidden');
      markFieldAsError('phone');
      return;
    }

    // بررسی نوع ملک
    const propertyTypeRadio = document.querySelector('input[name="propertyType"]:checked');
    const typeError = document.getElementById('typeError');
    if (!propertyTypeRadio) {
      typeError.classList.remove('hidden');
      document.querySelector('.section-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // بررسی نوع پیش‌فروش اگر پیش‌فروش انتخاب شده باشد
    if (propertyTypeRadio.id === 'presale') {
      const presaleTypeRadio = document.querySelector('input[name="presaleType"]:checked');
      if (!presaleTypeRadio) {
        alert('لطفاً نوع پیش‌فروش را انتخاب کنید.');
        document.getElementById('presaleTypeSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      // بررسی مرحله پیشرفت پروژه
      const projectProgress = document.getElementById('projectProgress');
      if (!projectProgress.value.trim()) {
        alert('لطفاً مرحله پیشرفت پروژه را وارد کنید.');
        projectProgress.classList.add('error-field');
        projectProgress.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    // بررسی وضعیت سند
    const documentChecks = document.querySelectorAll('input[name="document"]:checked');
    if (documentChecks.length === 0 && !document.getElementById('otherDocument').value.trim()) {
      document.getElementById('documentError').classList.remove('hidden');
      document.getElementById('singlePage').parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // بررسی شرایط فروش
    const saleConditions = document.querySelectorAll('input[name="saleConditions"]:checked');
    if (saleConditions.length === 0) {
      document.getElementById('saleConditionError').classList.remove('hidden');
      document.getElementById('cash').parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // بررسی قیمت و آدرس
    let priceValue = "";
    let priceField = null;
    
    if (propertyTypeRadio.id === 'apartment' || propertyTypeRadio.id === 'land' || propertyTypeRadio.id === 'commercial') {
      priceField = document.getElementById('totalPrice');
      if (!priceField.value) {
        alert('لطفاً قیمت کلی را وارد کنید.');
        priceField.classList.add('error-field');
        priceField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      priceValue = priceField.value;
    } else {
      priceField = document.getElementById('price');
      if (!priceField.value) {
        alert('لطفاً قیمت را وارد کنید.');
        priceField.classList.add('error-field');
        priceField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      priceValue = priceField.value;
    }

    const addressField = document.getElementById('address');
    if (!addressField.value) {
      alert('لطفاً آدرس دقیق را وارد کنید.');
      addressField.classList.add('error-field');
      addressField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // جمع‌آوری اطلاعات فرم
    const formData = {
      formCode: formCode,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      altPhone: document.getElementById('altPhone').value.trim(),
      propertyType: propertyTypeRadio.value,
      document: Array.from(document.querySelectorAll('input[name="document"]:checked')).map(cb => cb.value).join(', '),
      otherDocument: document.getElementById('otherDocument').value,
      price: priceValue,
      pricePerMeter: propertyTypeRadio.id === 'apartment' || propertyTypeRadio.id === 'land' || propertyTypeRadio.id === 'commercial' ? document.getElementById('pricePerMeter').value : '',
      saleConditions: Array.from(saleConditions).map(cb => cb.value).join(', '),
      saleConditionDetails: document.getElementById('saleConditionDetails').value,
      address: document.getElementById('address').value
    };

    // اگر آپارتمان انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    if (propertyTypeRadio.id === 'apartment') {
      // بررسی فیلدهای اجباری
      const landAreaApt = document.getElementById('landArea-apartment');
      if (!landAreaApt.value) {
        alert('لطفاً متراژ زمین را وارد کنید.');
        landAreaApt.classList.add('error-field');
        landAreaApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const unitAreaApt = document.getElementById('unitArea-apartment');
      if (!unitAreaApt.value) {
        alert('لطفاً متراژ واحد را وارد کنید.');
        unitAreaApt.classList.add('error-field');
        unitAreaApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const roomCountApt = document.getElementById('roomCount-apartment');
      if (!roomCountApt.value) {
        alert('لطفاً تعداد اتاق‌ها را وارد کنید.');
        roomCountApt.classList.add('error-field');
        roomCountApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const buildYearApt = document.getElementById('buildYear-apartment');
      if (!buildYearApt.value) {
        alert('لطفاً سال ساخت را وارد کنید.');
        buildYearApt.classList.add('error-field');
        buildYearApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // جمع‌آوری اطلاعات آپارتمان
      const locationRadio = document.querySelector('input[name="location-apartment"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-apartment').value;
      formData.landArea = document.getElementById('landArea-apartment').value;
      formData.unitArea = document.getElementById('unitArea-apartment').value;
      formData.roomCount = document.getElementById('roomCount-apartment').value;
      formData.buildYear = document.getElementById('buildYear-apartment').value;
      formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-apartment"]:checked')).map(cb => cb.value).join(', ');
      formData.otherKitchen = document.getElementById('otherKitchen-apartment').value;
      formData.facilities = Array.from(document.querySelectorAll('input[name="facilities-apartment"]:checked')).map(cb => cb.value).join(', ');
      formData.otherFacilities = document.getElementById('otherFacilities-apartment').value;
      formData.amenities = Array.from(document.querySelectorAll('input[name="amenities-apartment"]:checked')).map(cb => cb.value).join(', ');
      formData.otherAmenities = document.getElementById('otherAmenities-apartment').value;
      formData.commonAreas = Array.from(document.querySelectorAll('input[name="commonAreas-apartment"]:checked')).map(cb => cb.value).join(', ');
      formData.otherCommonAreas = document.getElementById('otherCommonAreas-apartment').value;
      formData.otherDetails = document.getElementById('otherDetails-apartment').value;
    }
    // اگر ویلا انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    else if (propertyTypeRadio.id === 'villa') {
      // بررسی فیلدهای اجباری
      const landAreaVilla = document.getElementById('landArea-villa');
      if (!landAreaVilla.value) {
        alert('لطفاً متراژ زمین را وارد کنید.');
        landAreaVilla.classList.add('error-field');
        landAreaVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const buildingAreaVilla = document.getElementById('buildingArea-villa');
      if (!buildingAreaVilla.value) {
        alert('لطفاً متراژ بنا را وارد کنید.');
        buildingAreaVilla.classList.add('error-field');
        buildingAreaVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const roomCountVilla = document.getElementById('roomCount-villa');
      if (!roomCountVilla.value) {
        alert('لطفاً تعداد اتاق‌ها را وارد کنید.');
        roomCountVilla.classList.add('error-field');
        roomCountVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const buildYearVilla = document.getElementById('buildYear-villa');
      if (!buildYearVilla.value) {
        alert('لطفاً سال ساخت را وارد کنید.');
        buildYearVilla.classList.add('error-field');
        buildYearVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // جمع‌آوری اطلاعات ویلا
      const locationRadio = document.querySelector('input[name="location-villa"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-villa').value;
      formData.landArea = document.getElementById('landArea-villa').value;
      formData.buildingArea = document.getElementById('buildingArea-villa').value;
      formData.roomCount = document.getElementById('roomCount-villa').value;
      formData.buildYear = document.getElementById('buildYear-villa').value;
      formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-villa"]:checked')).map(cb => cb.value).join(', ');
      formData.otherKitchen = document.getElementById('otherKitchen-villa').value;
      formData.facilities = Array.from(document.querySelectorAll('input[name="facilities-villa"]:checked')).map(cb => cb.value).join(', ');
      formData.otherFacilities = document.getElementById('otherFacilities-villa').value;
      formData.amenities = Array.from(document.querySelectorAll('input[name="amenities-villa"]:checked')).map(cb => cb.value).join(', ');
      formData.otherAmenities = document.getElementById('otherAmenities-villa').value;
      formData.otherDetails = document.getElementById('otherDetails-villa').value;
    }
    // اگر زمین انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    else if (propertyTypeRadio.id === 'land') {
      // بررسی فیلدهای اجباری
      const landAreaLand = document.getElementById('landArea-land');
      if (!landAreaLand.value) {
        alert('لطفاً متراژ زمین را وارد کنید.');
        landAreaLand.classList.add('error-field');
        landAreaLand.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const landUsage = document.getElementById('landUsage');
      if (!landUsage.value) {
        alert('لطفاً کاربری زمین را وارد کنید.');
        landUsage.classList.add('error-field');
        landUsage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // جمع‌آوری اطلاعات زمین
      const locationRadio = document.querySelector('input[name="location-land"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-land').value;
      formData.landArea = document.getElementById('landArea-land').value;
      formData.landUsage = document.getElementById('landUsage').value;
      formData.landWidth = document.getElementById('landWidth').value;
      formData.landDepth = document.getElementById('landDepth').value;
      
      const positionRadio = document.querySelector('input[name="position"]:checked');
      formData.position = positionRadio ? positionRadio.value : '';
      
      formData.alleyWidth = document.getElementById('alleyWidth').value;
      
      const enclosedRadio = document.querySelector('input[name="enclosed"]:checked');
      formData.enclosed = enclosedRadio ? enclosedRadio.value : '';
      
      formData.otherDetails = document.getElementById('otherDetails-land').value;
    }
    // اگر تجاری انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    else if (propertyTypeRadio.id === 'commercial') {
      // بررسی فیلدهای اجباری
      const shopArea = document.getElementById('shopArea');
      if (!shopArea.value) {
        alert('لطفاً متراژ مغازه را وارد کنید.');
        shopArea.classList.add('error-field');
        shopArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // جمع‌آوری اطلاعات تجاری
      formData.shopArea = document.getElementById('shopArea').value;
      formData.shopHeight = document.getElementById('shopHeight').value;
      formData.shopWidth = document.getElementById('shopWidth').value;
      formData.shopDetails = document.getElementById('shopDetails').value;
      formData.otherDetails = document.getElementById('otherDetails-commercial').value;
    }
    // اگر کلنگی انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    else if (propertyTypeRadio.id === 'old') {
      // بررسی فیلدهای اجباری
      const landAreaOld = document.getElementById('landArea-old');
      if (!landAreaOld.value) {
        alert('لطفاً متراژ زمین را وارد کنید.');
        landAreaOld.classList.add('error-field');
        landAreaOld.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const buildingAreaOld = document.getElementById('buildingArea-old');
      if (!buildingAreaOld.value) {
        alert('لطفاً متراژ بنا را وارد کنید.');
        buildingAreaOld.classList.add('error-field');
        buildingAreaOld.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // جمع‌آوری اطلاعات کلنگی
      const locationRadio = document.querySelector('input[name="location-old"]:checked');
      formData.location = locationRadio ? locationRadio.value : '';
      formData.otherLocation = document.getElementById('otherLocation-old').value;
      formData.landArea = document.getElementById('landArea-old').value;
      formData.buildingArea = document.getElementById('buildingArea-old').value;
      
      const livabilityRadio = document.querySelector('input[name="livability"]:checked');
      formData.livability = livabilityRadio ? livabilityRadio.value : '';
      
      formData.landWidth = document.getElementById('landWidth-old').value;
      formData.landDepth = document.getElementById('landDepth-old').value;
      formData.utilities = Array.from(document.querySelectorAll('input[name="utilities"]:checked')).map(cb => cb.value).join(', ');
      formData.amenitiesOld = document.getElementById('amenities-old').value;
    }
    // اگر پیش‌فروش انتخاب شده، بررسی و جمع‌آوری اطلاعات اضافی
    else if (propertyTypeRadio.id === 'presale') {
      const presaleTypeRadio = document.querySelector('input[name="presaleType"]:checked');
      formData.presaleType = presaleTypeRadio.value;
      formData.projectProgress = document.getElementById('projectProgress').value;
      
      // اگر پیش‌فروش آپارتمان انتخاب شده
      if (presaleTypeRadio.id === 'presale-apartment') {
        // بررسی فیلدهای اجباری
        const landAreaPresaleApt = document.getElementById('landArea-presale-apartment');
        if (!landAreaPresaleApt.value) {
          alert('لطفاً متراژ زمین را وارد کنید.');
          landAreaPresaleApt.classList.add('error-field');
          landAreaPresaleApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const unitAreaPresaleApt = document.getElementById('unitArea-presale-apartment');
        if (!unitAreaPresaleApt.value) {
          alert('لطفاً متراژ واحد را وارد کنید.');
          unitAreaPresaleApt.classList.add('error-field');
          unitAreaPresaleApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const roomCountPresaleApt = document.getElementById('roomCount-presale-apartment');
        if (!roomCountPresaleApt.value) {
          alert('لطفاً تعداد اتاق‌ها را وارد کنید.');
          roomCountPresaleApt.classList.add('error-field');
          roomCountPresaleApt.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        
        // جمع‌آوری اطلاعات پیش‌فروش آپارتمان
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
        formData.kitchen = Array.from(document.querySelectorAll('input[name="kitchen-presale-apartment"]:checked')).map(cb => cb.value).join(', ');
        formData.otherKitchen = document.getElementById('otherKitchen-presale-apartment').value;
        formData.otherDetails = document.getElementById('otherDetails-presale-apartment').value;
      } 
      // اگر پیش‌فروش ویلا انتخاب شده
      else if (presaleTypeRadio.id === 'presale-villa') {
        // بررسی فیلدهای اجباری
        const landAreaPresaleVilla = document.getElementById('landArea-presale-villa');
        if (!landAreaPresaleVilla.value) {
          alert('لطفاً متراژ زمین را وارد کنید.');
          landAreaPresaleVilla.classList.add('error-field');
          landAreaPresaleVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const buildingAreaPresaleVilla = document.getElementById('buildingArea-presale-villa');
        if (!buildingAreaPresaleVilla.value) {
          alert('لطفاً متراژ بنا را وارد کنید.');
          buildingAreaPresaleVilla.classList.add('error-field');
          buildingAreaPresaleVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const roomCountPresaleVilla = document.getElementById('roomCount-presale-villa');
        if (!roomCountPresaleVilla.value) {
          alert('لطفاً تعداد اتاق‌ها را وارد کنید.');
          roomCountPresaleVilla.classList.add('error-field');
          roomCountPresaleVilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        
        // جمع‌آوری اطلاعات پیش‌فروش ویلا
        const locationRadio = document.querySelector('input[name="location-presale-villa"]:checked');
        formData.location = locationRadio ? locationRadio.value : '';
        formData.otherLocation = document.getElementById('otherLocation-presale-villa').value;
        formData.landArea = document.getElementById('landArea-presale-villa').value;
        formData.buildingArea = document.getElementById('buildingArea-presale-villa').value;
        formData.roomCount = document.getElementById('roomCount-presale-villa').value;
        formData.floorCount = document.getElementById('floorCount-presale-villa').value;
        formData.otherDetails = document.getElementById('otherDetails-presale-villa').value;
      }
    }

    // ساخت پیام برای تلگرام (فقط مقادیر وارد شده)
    let message = `${formCode}\n\n`;
    message += `${firstName} ${lastName}\n`;
    message += `${phone}\n`;
    if (formData.altPhone) message += `${formData.altPhone}\n`;
    message += `${formData.propertyType}\n`;

    if (propertyTypeRadio.id === 'apartment') {
      if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.unitArea} متر واحد\n`;
      message += `${formData.roomCount} اتاق\n`;
      message += `سال ساخت ${formData.buildYear}\n`;
      
      if (formData.kitchen) message += `${formData.kitchen}\n`;
      if (formData.otherKitchen) message += `${formData.otherKitchen}\n`;
      if (formData.facilities || formData.otherFacilities) {
        message += `${formData.facilities}`;
        if (formData.otherFacilities) message += ` ${formData.otherFacilities}`;
        message += `\n`;
      }
      if (formData.amenities) message += `${formData.amenities}\n`;
      if (formData.otherAmenities) message += `${formData.otherAmenities}\n`;
      if (formData.commonAreas) message += `${formData.commonAreas}\n`;
      if (formData.otherCommonAreas) message += `${formData.otherCommonAreas}\n`;
      if (formData.otherDetails) message += `${formData.otherDetails}\n`;
    } else if (propertyTypeRadio.id === 'villa') {
      if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.buildingArea} متر بنا\n`;
      message += `${formData.roomCount} اتاق\n`;
      message += `سال ساخت ${formData.buildYear}\n`;
      
      if (formData.kitchen) message += `${formData.kitchen}\n`;
      if (formData.otherKitchen) message += `${formData.otherKitchen}\n`;
      if (formData.facilities || formData.otherFacilities) {
        message += `${formData.facilities}`;
        if (formData.otherFacilities) message += ` ${formData.otherFacilities}`;
        message += `\n`;
      }
      if (formData.amenities) message += `${formData.amenities}\n`;
      if (formData.otherAmenities) message += `${formData.otherAmenities}\n`;
      if (formData.otherDetails) message += `${formData.otherDetails}\n`;
    } else if (propertyTypeRadio.id === 'land') {
      if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
      message += `${formData.landArea} متر\n`;
      message += `کاربری ${formData.landUsage}\n`;
      
      if (formData.landWidth) message += `بر ${formData.landWidth} متر\n`;
      if (formData.landDepth) message += `عمق ${formData.landDepth} متر\n`;
      if (formData.alleyWidth) message += `عرض کوچه ${formData.alleyWidth} متر\n`;
      if (formData.enclosed) message += `دور زمین محصور ${formData.enclosed}\n`;
      if (formData.position) message += `${formData.position}\n`;
      
      if (formData.otherDetails) message += `${formData.otherDetails}\n`;
    } else if (propertyTypeRadio.id === 'commercial') {
      message += `${formData.shopArea} متر\n`;
      if (formData.shopHeight) message += `ارتفاع ${formData.shopHeight} متر\n`;
      if (formData.shopWidth) message += `دهنه ${formData.shopWidth} متر\n`;
      if (formData.shopDetails) message += `${formData.shopDetails}\n`;
      if (formData.otherDetails) message += `${formData.otherDetails}\n`;
    } else if (propertyTypeRadio.id === 'old') {
      if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
      message += `${formData.landArea} متر زمین\n`;
      message += `${formData.buildingArea} متر بنا\n`;
      
      if (formData.livability) message += `${formData.livability}\n`;
      if (formData.landWidth) message += `بر ${formData.landWidth} متر\n`;
      if (formData.landDepth) message += `عمق ${formData.landDepth} متر\n`;
      
      if (formData.utilities) message += `${formData.utilities}\n`;
      if (formData.amenitiesOld) message += `${formData.amenitiesOld}\n`;
    } else if (propertyTypeRadio.id === 'presale') {
      message += `${formData.presaleType}\n`;
      message += `${formData.projectProgress}\n`;
      
      if (formData.presaleType === 'آپارتمان') {
        if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
        message += `${formData.landArea} متر زمین\n`;
        message += `${formData.unitArea} متر واحد\n`;
        message += `${formData.roomCount} اتاق\n`;
        if (formData.floorCount) message += `${formData.floorCount} طبقه\n`;
        if (formData.floorNumber) message += `طبقه ${formData.floorNumber}\n`;
        if (formData.unitsPerFloor) message += `${formData.unitsPerFloor} واحد در هر طبقه\n`;
        if (formData.moreDetails) message += `${formData.moreDetails}\n`;
        
        if (formData.kitchen) message += `${formData.kitchen}\n`;
        if (formData.otherKitchen) message += `${formData.otherKitchen}\n`;
      } else if (formData.presaleType === 'ویلا') {
        if (formData.location) message += `${formData.location}${formData.otherLocation ? ' (' + formData.otherLocation + ')' : ''}\n`;
        message += `${formData.landArea} متر زمین\n`;
        message += `${formData.buildingArea} متر بنا\n`;
        message += `${formData.roomCount} اتاق\n`;
        if (formData.floorCount) message += `${formData.floorCount} طبقه\n`;
      }
      
      if (formData.otherDetails) message += `${formData.otherDetails}\n`;
    }
    
    if (formData.document || formData.otherDocument) {
      message += `${formData.document}`;
      if (formData.otherDocument) message += ` ${formData.otherDocument}`;
      message += `\n`;
    }
    
    if (formData.pricePerMeter) {
      message += `قیمت متری ${formData.pricePerMeter} تومان\n`;
    }
    message += `قیمت ${formData.price} تومان\n`;
    message += `${formData.saleConditions}\n`;
    if (formData.saleConditionDetails) message += `${formData.saleConditionDetails}\n`;
    message += `${formData.address}\n`;

    try {
      // نمایش پیام بارگذاری
      const submitButton = document.querySelector('.submit-btn');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'در حال ارسال...';
      submitButton.disabled = true;

      // ارسال پیام به تلگرام
      const messageSent = await sendMessageToTelegram(message);
      if (!messageSent) {
        throw new Error('خطا در ارسال پیام');
      }

      // ارسال عکس‌ها به تلگرام
      for (let i = 0; i < uploadedImages.length; i++) {
        const imageSent = await sendImageToTelegram(uploadedImages[i].file);
        if (!imageSent) {
          throw new Error('خطا در ارسال عکس');
        }
      }

      // نمایش پیام موفقیت
      successOverlay.style.display = 'flex';
      
      // پاک کردن فرم
      this.reset();
      document.getElementById('imagePreview').innerHTML = '';
      uploadedImages = [];
      
      // بازگرداندن متن دکمه
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      
      // مخفی کردن بخش‌های اضافی
      document.getElementById('apartmentDetails').classList.add('hidden');
      document.getElementById('villaDetails').classList.add('hidden');
      document.getElementById('landDetails').classList.add('hidden');
      document.getElementById('commercialDetails').classList.add('hidden');
      document.getElementById('oldDetails').classList.add('hidden');
      document.getElementById('presaleTypeSection').classList.add('hidden');
      document.getElementById('presaleApartmentDetails').classList.add('hidden');
      document.getElementById('presaleVillaDetails').classList.add('hidden');
      document.getElementById('commonDetails').classList.add('hidden');
      document.getElementById('imageUploadSection').classList.add('hidden');
      document.getElementById('priceSection-meter').classList.add('hidden');
      document.getElementById('priceSection-normal').classList.add('hidden');
      
    } catch (error) {
      console.error('خطا:', error);
      alert('خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
      
      // بازگرداندن متن دکمه
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});