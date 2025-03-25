document.addEventListener('DOMContentLoaded', function() {
  // تنظیم EmailJS
  emailjs.init("YOUR_USER_ID"); // جایگزین کنید با شناسه کاربری EmailJS خود
  
  // انتخاب عناصر DOM
  const propertyForm = document.getElementById('propertyForm');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  const resetBtn = document.getElementById('resetBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  const successOverlay = document.getElementById('successOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const imageErrorOverlay = document.getElementById('imageErrorOverlay');
  const closeImageErrorBtn = document.getElementById('closeImageErrorBtn');
  const sendingOverlay = document.getElementById('sendingOverlay');
  
  // نمایش/مخفی کردن منوی همبرگری
  hamburgerMenu.addEventListener('click', function() {
    menuOverlay.style.display = 'flex';
  });
  
  menuClose.addEventListener('click', function() {
    menuOverlay.style.display = 'none';
  });
  
  // تنظیم رویداد برای دکمه پاک کردن
  resetBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'flex';
  });
  
  confirmYesBtn.addEventListener('click', function() {
    propertyForm.reset();
    hideAllDetailSections();
    confirmOverlay.style.display = 'none';
  });
  
  confirmNoBtn.addEventListener('click', function() {
    confirmOverlay.style.display = 'none';
  });
  
  closeSuccessBtn.addEventListener('click', function() {
    successOverlay.style.display = 'none';
    propertyForm.reset();
    hideAllDetailSections();
  });
  
  closeImageErrorBtn.addEventListener('click', function() {
    imageErrorOverlay.style.display = 'none';
  });
  
  // مخفی کردن همه بخش‌های جزئیات
  function hideAllDetailSections() {
    const detailSections = [
      'apartmentDetails',
      'villaDetails',
      'landDetails',
      'commercialDetails',
      'oldDetails',
      'presaleTypeSection',
      'presaleApartmentDetails',
      'presaleVillaDetails',
      'commonDetails',
      'imageUploadSection',
      'priceSection-meter',
      'priceSection-normal'
    ];
    
    detailSections.forEach(section => {
      document.getElementById(section).classList.add('hidden');
    });
    
    // پاک کردن پیش‌نمایش عکس‌ها
    document.getElementById('imagePreview').innerHTML = '';
  }
  
  // نمایش بخش‌های مربوط به نوع ملک
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  propertyTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      hideAllDetailSections();
      document.getElementById('typeError').classList.add('hidden');
      
      const propertyType = this.value;
      
      // نمایش بخش جزئیات مربوط به نوع ملک
      if (propertyType === 'آپارتمان') {
        document.getElementById('apartmentDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (propertyType === 'ویلا') {
        document.getElementById('villaDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (propertyType === 'زمین') {
        document.getElementById('landDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (propertyType === 'تجاری') {
        document.getElementById('commercialDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (propertyType === 'کلنگی') {
        document.getElementById('oldDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (propertyType === 'پیش‌فروش') {
        document.getElementById('presaleTypeSection').classList.remove('hidden');
      }
    });
  });
  
  // نمایش بخش‌های مربوط به نوع پیش‌فروش
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  presaleTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const presaleType = this.value;
      
      document.getElementById('presaleApartmentDetails').classList.add('hidden');
      document.getElementById('presaleVillaDetails').classList.add('hidden');
      
      if (presaleType === 'آپارتمان') {
        document.getElementById('presaleApartmentDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-meter').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      } else if (presaleType === 'ویلا') {
        document.getElementById('presaleVillaDetails').classList.remove('hidden');
        document.getElementById('commonDetails').classList.remove('hidden');
        document.getElementById('priceSection-normal').classList.remove('hidden');
        document.getElementById('imageUploadSection').classList.remove('hidden');
      }
    });
  });
  
  // محدود کردن ورودی به اعداد فارسی و انگلیسی
  const numericInputs = document.querySelectorAll('.numeric-only');
  numericInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9۰-۹]/g, '');
    });
  });
  
  // محدود کردن ورودی به حروف فارسی
  const persianInputs = document.querySelectorAll('.persian-only');
  persianInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[a-zA-Z0-9]/g, '');
    });
  });
  
  // محاسبه قیمت کلی بر اساس قیمت متری
  const pricePerMeterInput = document.getElementById('pricePerMeter');
  pricePerMeterInput.addEventListener('input', function() {
    calculateTotalPrice();
  });
  
  function calculateTotalPrice() {
    const pricePerMeter = parseFloat(pricePerMeterInput.value.replace(/,/g, '')) || 0;
    let area = 0;
    
    const selectedPropertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
    
    if (selectedPropertyType === 'آپارتمان') {
      area = parseFloat(document.getElementById('unitArea-apartment').value) || 0;
    } else if (selectedPropertyType === 'زمین') {
      area = parseFloat(document.getElementById('landArea-land').value) || 0;
    } else if (selectedPropertyType === 'پیش‌فروش') {
      const selectedPresaleType = document.querySelector('input[name="presaleType"]:checked')?.value;
      if (selectedPresaleType === 'آپارتمان') {
        area = parseFloat(document.getElementById('unitArea-presale-apartment').value) || 0;
      }
    }
    
    const totalPrice = pricePerMeter * area;
    document.getElementById('totalPrice').value = totalPrice.toLocaleString();
  }
  
  // آپدیت قیمت کلی وقتی متراژ تغییر می‌کند
  document.getElementById('unitArea-apartment').addEventListener('input', calculateTotalPrice);
  document.getElementById('landArea-land').addEventListener('input', calculateTotalPrice);
  document.getElementById('unitArea-presale-apartment').addEventListener('input', calculateTotalPrice);
  
  // فرمت کردن ورودی قیمت
  const priceInputs = document.querySelectorAll('.price-input');
  priceInputs.forEach(input => {
    input.addEventListener('input', function() {
      // حذف همه کاراکترهای غیر عددی
      const value = this.value.replace(/[^0-9]/g, '');
      
      // اضافه کردن کاما
      this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
  });
  
  // آپلود عکس و نمایش پیش‌نمایش
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  const maxImages = 3;
  let uploadedImages = [];
  
  imageUpload.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    if (files.length + uploadedImages.length > maxImages) {
      imageErrorOverlay.style.display = 'flex';
      return;
    }
    
    files.forEach(file => {
      if (file.type.match('image.*') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'relative';
          imgContainer.appendChild(img);
          
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '×';
          removeBtn.style.position = 'absolute';
          removeBtn.style.top = '5px';
          removeBtn.style.right = '5px';
          removeBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
          removeBtn.style.color = 'white';
          removeBtn.style.border = 'none';
          removeBtn.style.borderRadius = '50%';
          removeBtn.style.width = '20px';
          removeBtn.style.height = '20px';
          removeBtn.style.cursor = 'pointer';
          removeBtn.style.display = 'flex';
          removeBtn.style.justifyContent = 'center';
          removeBtn.style.alignItems = 'center';
          removeBtn.style.fontSize = '16px';
          
          removeBtn.addEventListener('click', function() {
            imgContainer.remove();
            uploadedImages = uploadedImages.filter(image => image.name !== file.name);
          });
          
          imgContainer.appendChild(removeBtn);
          imagePreview.appendChild(imgContainer);
          uploadedImages.push(file);
        };
        
        reader.readAsDataURL(file);
      }
    });
  });
  
  // اعتبارسنجی فرم
  propertyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // اعتبارسنجی نام
    const firstName = document.getElementById('firstName').value.trim();
    if (firstName === '') {
      document.getElementById('firstNameError').classList.remove('hidden');
      document.getElementById('firstName').classList.add('error-field');
      isValid = false;
    } else {
      document.getElementById('firstNameError').classList.add('hidden');
      document.getElementById('firstName').classList.remove('error-field');
    }
    
    // اعتبارسنجی نام خانوادگی
    const lastName = document.getElementById('lastName').value.trim();
    if (lastName === '') {
      document.getElementById('lastNameError').classList.remove('hidden');
      document.getElementById('lastName').classList.add('error-field');
      isValid = false;
    } else {
      document.getElementById('lastNameError').classList.add('hidden');
      document.getElementById('lastName').classList.remove('error-field');
    }
    
    // اعتبارسنجی شماره تماس
    const phone = document.getElementById('phone').value.trim();
    if (phone === '' || (phone.length !== 11 && phone.length !== 10)) {
      document.getElementById('phoneError').classList.remove('hidden');
      document.getElementById('phone').classList.add('error-field');
      isValid = false;
    } else {
      document.getElementById('phoneError').classList.add('hidden');
      document.getElementById('phone').classList.remove('error-field');
    }
    
    // اعتبارسنجی شماره تماس دیگر (اختیاری)
    const altPhone = document.getElementById('altPhone').value.trim();
    if (altPhone !== '' && altPhone.length < 10) {
      document.getElementById('altPhoneError').classList.remove('hidden');
      document.getElementById('altPhone').classList.add('error-field');
      isValid = false;
    } else {
      document.getElementById('altPhoneError').classList.add('hidden');
      document.getElementById('altPhone').classList.remove('error-field');
    }
    
    // اعتبارسنجی نوع ملک
    const propertyType = document.querySelector('input[name="propertyType"]:checked');
    if (!propertyType) {
      document.getElementById('typeError').classList.remove('hidden');
      isValid = false;
    } else {
      document.getElementById('typeError').classList.add('hidden');
      
      // اعتبارسنجی‌های اضافی بر اساس نوع ملک
      if (propertyType.value === 'پیش‌فروش') {
        const presaleType = document.querySelector('input[name="presaleType"]:checked');
        if (!presaleType) {
          isValid = false;
        }
      }
    }
    
    // اعتبارسنجی وضعیت سند
    if (!document.getElementById('commonDetails').classList.contains('hidden')) {
      const documentChecked = document.querySelector('input[name="document"]:checked');
      if (!documentChecked) {
        document.getElementById('documentError').classList.remove('hidden');
        isValid = false;
      } else {
        document.getElementById('documentError').classList.add('hidden');
      }
      
      // اعتبارسنجی شرایط فروش
      const saleConditionsChecked = document.querySelector('input[name="saleConditions"]:checked');
      if (!saleConditionsChecked) {
        document.getElementById('saleConditionError').classList.remove('hidden');
        isValid = false;
      } else {
        document.getElementById('saleConditionError').classList.add('hidden');
      }
    }
    
    // اگر فرم معتبر است، ارسال اطلاعات
    if (isValid) {
      sendingOverlay.style.display = 'flex';
      
      // جمع‌آوری اطلاعات فرم
      const formData = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        altPhone: altPhone,
        propertyType: propertyType.value,
        // سایر فیلدها بر اساس نوع ملک
      };
      
      // ارسال به سرور یا EmailJS
      setTimeout(function() {
        sendingOverlay.style.display = 'none';
        successOverlay.style.display = 'flex';
        
        // ارسال به تلگرام
        sendToTelegram(formData);
      }, 2000);
    }
  });
  
  // ارسال اطلاعات به تلگرام
  function sendToTelegram(data) {
    const botToken = 'YOUR_BOT_TOKEN'; // توکن ربات تلگرام خود را اینجا وارد کنید
    const chatId = 'YOUR_CHAT_ID'; // شناسه چت یا کانال تلگرام خود را اینجا وارد کنید
    
    // ساخت متن پیام
    let message = `🏠 *اطلاعات ملک جدید*\n\n`;
    message += `👤 *نام و نام خانوادگی:* ${data.firstName} ${data.lastName}\n`;
    message += `📞 *شماره تماس:* ${data.phone}\n`;
    if (data.altPhone) {
      message += `📞 *شماره تماس دیگر:* ${data.altPhone}\n`;
    }
    message += `🏢 *نوع ملک:* ${data.propertyType}\n`;
    
    // اضافه کردن سایر اطلاعات بر اساس نوع ملک
    // ...
    
    // ارسال پیام به تلگرام
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const params = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    };
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => console.log('پیام با موفقیت ارسال شد:', data))
    .catch(error => console.error('خطا در ارسال پیام:', error));
  }
});