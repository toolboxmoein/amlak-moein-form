document.addEventListener('DOMContentLoaded', function() {
  // ======================================================
  // ========== تنظیمات EmailJS با شناسه‌های نهایی ==========
  // ======================================================
  (function() {
    emailjs.init({
      publicKey: "7zOCMQKl0bRjmv6cn" // <<-- *** Public Key صحیح با 'l' کوچک ***
    });
  })();
  // ======================================================

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

  // ******** تابع تنظیم تاریخ شمسی ********
  function setJalaliDate() {
    try {
        const today = new Date();
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            calendar: 'persian', timeZone: 'Asia/Tehran'
        };
        const persianDate = new Intl.DateTimeFormat('fa-IR', options).format(today);
        const dateInput = document.getElementById('registrationDate');
        if (dateInput) { dateInput.value = persianDate; }
    } catch (error) {
        console.error("Error setting Jalali date:", error);
        const dateInput = document.getElementById('registrationDate');
        if (dateInput) { dateInput.placeholder = "خطا در دریافت تاریخ"; }
    }
  }

  // ******** فراخوانی تابع تنظیم تاریخ شمسی در ابتدا ********
  setJalaliDate();

  // تنظیم رویدادها
  setupEventListeners();
  setupNumericInputs();

  // تنظیم فیلدهای عددی برای کیبورد مخصوص اعداد
  function setupNumericInputs() {
    document.querySelectorAll('.numeric-only, .price-input').forEach(input => {
      input.setAttribute('inputmode', 'numeric');
    });
  }

  // تنظیم رویدادهای فرم (بر اساس کدی که قبلا بهتر کار می‌کرد)
  function setupEventListeners() {
    propertyTypeRadios.forEach(radio => radio.addEventListener('change', handlePropertyTypeChange));
    presaleTypeRadios.forEach(radio => radio.addEventListener('change', handlePresaleTypeChange));

    // ورودی‌های عددی
    document.querySelectorAll('.numeric-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });
    });

    // ورودی‌های فارسی
    document.querySelectorAll('.persian-letters-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^آ-یءچحجژ\s]/g, ''); });
    });
    document.querySelectorAll('.persian-and-numbers-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^آ-یءچحجژ0-9\s.,()\-]/g, ''); });
    });

    // فرمت قیمت
    document.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('input', function(e) {
        let value = this.value.replace(/[^\d]/g, '');
        this.value = value ? formatNumber(value) : '';
      });
    });

    // --- محاسبه خودکار قیمت‌ها (مطابق کدهای قبلی که کار می‌کرد) ---
    document.getElementById('unitArea-apartment')?.addEventListener('input', calculateApartmentTotalPrice);
    document.getElementById('pricePerMeter-apartment')?.addEventListener('input', calculateApartmentTotalPrice);
    document.getElementById('landArea-land')?.addEventListener('input', calculateLandTotalPrice);
    document.getElementById('pricePerMeter-land')?.addEventListener('input', calculateLandTotalPrice);
    document.getElementById('shopArea')?.addEventListener('input', calculateCommercialTotalPrice);
    document.getElementById('pricePerMeter-commercial')?.addEventListener('input', calculateCommercialTotalPrice);
    document.getElementById('unitArea-presale-apartment')?.addEventListener('input', calculatePresaleApartmentTotalPrice);
    document.getElementById('pricePerMeter-presale-apartment')?.addEventListener('input', calculatePresaleApartmentTotalPrice);

    // دکمه‌ها
    document.getElementById('resetBtn')?.addEventListener('click', showConfirmOverlay);
    document.getElementById('confirmYesBtn')?.addEventListener('click', resetForm);
    document.getElementById('confirmNoBtn')?.addEventListener('click', hideConfirmOverlay);
    document.getElementById('closeSuccessBtn')?.addEventListener('click', hideSuccessOverlay);
    document.getElementById('closeErrorBtn')?.addEventListener('click', hideErrorOverlay);

    // منو
    document.getElementById('hamburgerMenu')?.addEventListener('click', showMenuOverlay);
    document.getElementById('menuClose')?.addEventListener('click', hideMenuOverlay);

    // ارسال فرم
    document.getElementById('propertyForm')?.addEventListener('submit', handleFormSubmit);

    // اعتبارسنجی حین تایپ (ساده شده)
    document.querySelectorAll('input[required], textarea[required]').forEach(input => {
      input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
          hideFieldError(this.id);
          checkAndHideErrorsContainer();
        }
      });
    });
    // پاک کردن خطای چک‌باکس/رادیو هنگام تغییر (ساده شده)
    document.querySelectorAll('input[type="checkbox"][name^="saleConditions"], input[type="radio"][name^="document"]').forEach(input => {
        input.addEventListener('change', function() {
            const errorId = this.name + '-' + getSelectedPropertyTypeKey() + 'Error'; // Construct potential error ID
            hideFieldError(errorId); // Hide specific error if it exists
            checkAndHideErrorsContainer();
        });
    });
    propertyTypeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        hideFieldError('typeError'); // Use helper
        checkAndHideErrorsContainer();
      });
    });
    presaleTypeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        hideFieldError('presaleTypeError'); // Use helper
        checkAndHideErrorsContainer();
      });
    });
  }

  // --- توابع کمکی فرمت و نمایش/مخفی‌سازی ---
  function formatNumber(num) {
    num = String(num).replace(/,/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function unformatNumber(formattedNum) {
    if (typeof formattedNum !== 'string') return NaN;
    return parseInt(formattedNum.replace(/,/g, ''), 10);
  }

  function checkAndHideErrorsContainer() {
    const errorsList = document.getElementById('errorsList');
    const validationErrorsContainer = document.getElementById('validationErrors');
    if (!errorsList || !validationErrorsContainer) return;

    // Check if any individual error messages are visible
    const visibleErrors = document.querySelectorAll('.error:not(.hidden)');
    if (visibleErrors.length === 0 && errorsList.children.length === 0) {      validationErrorsContainer.classList.add('hidden');
    }
  }

  // --- توابع محاسبه قیمت (مطابق کدهای قبلی که کار می‌کرد) ---
  function calculateApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-apartment')?.value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-apartment')?.value.trim();
    const totalPriceField = document.getElementById('totalPrice-apartment');
    if (totalPriceField && unitArea && pricePerMeter) {
      const area = unformatNumber(unitArea);
      const price = unformatNumber(pricePerMeter);
      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        totalPriceField.value = formatNumber(area * price);
        hideFieldError('totalPrice-apartment'); // Hide error if calculation is successful
      }
    }
  }
  function calculateLandTotalPrice() {
    const landArea = document.getElementById('landArea-land')?.value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-land')?.value.trim();    const totalPriceField = document.getElementById('totalPrice-land');
    if (totalPriceField && landArea && pricePerMeter) {
      const area = unformatNumber(landArea);
      const price = unformatNumber(pricePerMeter);
      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        totalPriceField.value = formatNumber(area * price);
        hideFieldError('totalPrice-land');
      }
    }
  }
  function calculateCommercialTotalPrice() {
    const shopArea = document.getElementById('shopArea')?.value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-commercial')?.value.trim();
    const totalPriceField = document.getElementById('totalPrice-commercial');
    if (totalPriceField && shopArea && pricePerMeter) {
      const area = unformatNumber(shopArea);
      const price = unformatNumber(pricePerMeter);
      if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
        totalPriceField.value = formatNumber(area * price);        hideFieldError('totalPrice-commercial');
      }
    }
  }
  function calculatePresaleApartmentTotalPrice() {
    const unitArea = document.getElementById('unitArea-presale-apartment')?.value.trim();
    const pricePerMeter = document.getElementById('pricePerMeter-presale-apartment')?.value.trim();
    const totalPriceField = document.getElementById('totalPrice-presale-apartment');
    if (totalPriceField && unitArea && pricePerMeter) {
        const area = unformatNumber(unitArea);
        const price = unformatNumber(pricePerMeter);
        if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) {
            totalPriceField.value = formatNumber(area * price);
            hideFieldError('totalPrice-presale-apartment');
        }
    }
  }

  // --- توابع مدیریت نمایش بخش‌ها ---
  function handlePropertyTypeChange() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return;
    const selectedType = selectedTypeInput.value;
    Object.values(detailSections).forEach(section => section?.classList.add('hidden'));
    Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));
    if (detailSections[selectedType]) {
      detailSections[selectedType].classList.remove('hidden');
    }
    hideFieldError('typeError'); // Clear type error on change
    playSound('dingSound');
  }

  function handlePresaleTypeChange() {
     const selectedTypeInput = document.querySelector('input[name="presaleType"]:checked');
     if (!selectedTypeInput) return;
    const selectedType = selectedTypeInput.value;
    Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));
    if (presaleDetailSections[selectedType]) {
      presaleDetailSections[selectedType].classList.remove('hidden');
    }
    hideFieldError('presaleTypeError'); // Clear presale type error on change
    playSound('dingSound');
  }

  // --- تابع اصلی ارسال فرم ---
  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
        console.log("Form validation failed.");
        playSound('errorSound'); // Play error sound on validation fail
        return;
    }

    console.log("Form validation passed. Attempting to send email...");
    showSendingOverlayWithProgress();
    try {      // simulateProgress(); // Keep simulation for visual feedback
      const formData = collectFormData();
      console.log("Collected form data:", formData);
      await sendEmail(formData); // ارسال واقعی
      console.log("EmailJS send successful (promise resolved).");
      hideOverlay('sendingOverlay');
      showSuccessOverlay();
      playSound('successSound');
    } catch (error) {
      console.error("EmailJS Send Error:", error); // لاگ کامل خطا
      hideOverlay('sendingOverlay'); // Hide sending overlay on error

      const errorOverlayContent = document.querySelector('#errorOverlay .overlay-content p:first-of-type');
      let userErrorMessage = "متاسفانه مشکلی در هنگام ثبت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.";

      // تشخیص نوع خطا بر اساس پیام یا کد وضعیت
      if (error && typeof error === 'object') {
          if (error.status === 400) {
                if (error.text?.includes("service ID not found")) {
                    userErrorMessage = "خطا: شناسه سرویس EmailJS یافت نشد (Service ID اشتباه است).";
                } else if (error.text?.includes("template ID not found")) {
                    userErrorMessage = "خطا: شناسه قالب EmailJS یافت نشد (Template ID اشتباه است).";
                } else if (error.text?.includes("template parameter is invalid")) {
                    userErrorMessage = "خطا: پارامترهای ارسالی به قالب ایمیل نامعتبر است. لطفاً مقادیر فیلدها را بررسی کنید.";
                } else {
                    userErrorMessage = "اطلاعات ارسال شده ناقص یا نامعتبر است (خطای 400).";
                }
                console.error("EmailJS Error Details (400):", error.text);
           } else if (error.status === 404 && error.text === "Account not found") {
                userErrorMessage = "خطا: حساب کاربری EmailJS یافت نشد (Public Key اشتباه است).";                console.error("EmailJS Error Details (404):", error.text);
           } else {
                // سایر خطاها
                console.error("EmailJS Error Details (Other):", error.text || error);
           }
      } else {
          // خطاهای غیرمنتظره (مثلا خطای شبکه)
          console.error("Unexpected Error:", error);
          userErrorMessage = "خطای غیرمنتظره در ارسال اطلاعات رخ داد.";
      }

      if (errorOverlayContent) {
          errorOverlayContent.textContent = userErrorMessage;
      }
      showErrorOverlay();
      playSound('errorSound'); // Play error sound on send fail
    }
  }

  // شبیه‌سازی پیشرفت (اختیاری)
  async function simulateProgress() {
    const progressBar = document.getElementById('sendingProgressBar');
     if (!progressBar) return;
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    for (let i = 0; i <= 100; i += 5) {
        if (!document.getElementById('sendingProgressBar')) break;
        progressBar.style.width = i + '%';
        progressBar.setAttribute('aria-valuenow', i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
     if (document.getElementById('sendingProgressBar')) {
        progressBar.style.width = '100%';
        progressBar.setAttribute('aria-valuenow', 100);
     }
  }

  // --- توابع اعتبارسنجی (بر اساس کدی که قبلا بهتر کار می‌کرد) ---
  function validateForm() {
    let isValid = true;    const errors = [];
    // Clear all previous errors visually and from the list
    document.querySelectorAll('.error').forEach(el => { el.classList.add('hidden'); el.textContent = ''; });
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    document.getElementById('validationErrors')?.classList.add('hidden');
    document.getElementById('errorsList')?.replaceChildren(); // Clear error list

    // --- Basic Info Validation ---
    if (!validateField('firstName', 'نام را وارد کنید')) { isValid = false; errors.push('نام'); }
    if (!validateField('lastName', 'نام خانوادگی را وارد کنید')) { isValid = false; errors.push('نام خانوادگی'); }
    if (!validateField('phone', 'شماره تماس را وارد کنید')) { isValid = false; errors.push('شماره تماس'); }
    else if (!validatePhone('phone')) { isValid = false; errors.push('شماره تماس (فرمت 09xxxxxxxxx)'); }

    // --- Property Type Validation ---
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) {
      showFieldError('typeError', 'لطفاً نوع ملک را انتخاب کنید');
      isValid = false; errors.push('نوع ملک');
    } else {
      const propertyTypeKey = getSelectedPropertyTypeKey(); // 'apartment', 'presale-base', 'presale-villa' etc.

      if (!propertyTypeKey) {
          isValid = false; errors.push('خطای داخلی: نوع ملک نامشخص');
      } else if (propertyTypeKey === 'presale-base') { // Presale selected, need subtype
          const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
          if (!selectedPresaleTypeInput) {
             showFieldError('presaleTypeError', 'لطفاً نوع پیش‌فروش را انتخاب کنید');
             isValid = false; errors.push('نوع پیش‌فروش');
          } else {
             // Validate progress only if presale type is selected
             if (!validateField('projectProgress', 'پیشرفت پروژه را وارد کنید')) { isValid = false; errors.push('پیشرفت پروژه'); }
             // Now get the specific presale key (e.g., 'presale-apartment') for detail validation
             const specificPresaleKey = getSelectedPropertyTypeKey();
             if (specificPresaleKey && specificPresaleKey !== 'presale-base' && !validatePropertyType(specificPresaleKey)) {
                isValid = false;
                errors.push(...collectPropertyTypeErrors(specificPresaleKey));
             }
          }
      } else { // For non-presale types or specific presale types (e.g., 'presale-apartment')
          if (!validatePropertyType(propertyTypeKey)) {
              isValid = false;
              errors.push(...collectPropertyTypeErrors(propertyTypeKey));
          }
      }
    }

    // --- Display Errors ---
    if (!isValid) {
        showValidationErrors([...new Set(errors)]); // Show unique errors
    }
    return isValid;
  }

  // Collects names of fields that failed validation for a specific property type
  function collectPropertyTypeErrors(propertyTypeKey) {
    const errorFieldNames = [];
    const requiredFields = getRequiredFieldsForPropertyType(propertyTypeKey);
    requiredFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      // Check if the field is required, empty, OR has the error-field class (failed other validation like format)
      if (element?.required && (element.value.trim() === '' || element.classList.contains('error-field'))) {
        const label = document.querySelector(`label[for="${fieldId}"]`);
        errorFieldNames.push(label ? label.textContent.replace('*', '').trim() : fieldId);
      }
    });
    // Check specific error elements for radio/checkbox groups (if they are not hidden)
    if (!document.getElementById(`document-${propertyTypeKey}Error`)?.classList.contains('hidden')) {
        errorFieldNames.push('وضعیت سند');
    }
    if (!document.getElementById(`saleConditions-${propertyTypeKey}Error`)?.classList.contains('hidden')) {
        errorFieldNames.push('شرایط فروش');
    }
    return errorFieldNames;
  }

  // Displays the collected validation errors in the designated area
  function showValidationErrors(errors) {
    const errorsList = document.getElementById('errorsList');    const validationErrorsContainer = document.getElementById('validationErrors');
     if (!errorsList || !validationErrorsContainer) return;
    errorsList.innerHTML = ''; // Clear previous errors
     if (errors.length === 0) {
         validationErrorsContainer.classList.add('hidden');
         return;
     }
    errors.forEach(error => { const li = document.createElement('li'); li.textContent = error; errorsList.appendChild(li); });
    validationErrorsContainer.classList.remove('hidden');
    validationErrorsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Validates a single field based on required attribute and value
  function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return true; // Field doesn't exist, consider valid
    let isValid = true;
    if (field.required && field.value.trim() === '') {
      isValid = false;
      showFieldError(fieldId, errorMessage); // Use helper to show error
    } else {
       hideFieldError(fieldId); // Use helper to hide error if valid
    }
    return isValid;
  }

  // Validates phone number format
  function validatePhone(fieldId) {
    const field = document.getElementById(fieldId);
     if (!field) return true;
    const value = field.value.trim();
    let isValid = true;     if (value !== '') { // Only validate format if not empty
        if (!/^09\d{9}$/.test(value)) {
          isValid = false;
          showFieldError(fieldId, 'فرمت صحیح شماره موبایل 09xxxxxxxxx است');
        } else {
            hideFieldError(fieldId); // Format is correct
        }
    } else if (field.required) {
        // Required and empty case is handled by validateField, but ensure error is shown if needed
        // This function mainly focuses on format validation
        isValid = false; // Mark as invalid if required and empty
    } else {
         hideFieldError(fieldId); // Not required and empty, clear error
     }
    return isValid;
  }

  // Validates fields specific to a property type (required fields, radio, checkbox)
  function validatePropertyType(propertyTypeKey) {
    let isValid = true;
    const requiredFields = getRequiredFieldsForPropertyType(propertyTypeKey);
    requiredFields.forEach(fieldId => {
        // Validate numeric fields specifically if needed (e.g., ensure they are numbers)
        // For now, just check if required and filled
        if (!validateField(fieldId, `این فیلد الزامی است`)) {
            isValid = false;
        }
    });

    // Validate Document Radio
    const documentRadioName = 'document';
    // Construct the selector based on expected ID structure (e.g., document-apartment-option1)
    const documentSelector = `input[name="${documentRadioName}"][id^="document-${propertyTypeKey}-"]:checked`;
    const documentChecked = document.querySelector(documentSelector);
    if (!documentChecked) {
      isValid = false;      // Use the error element ID structure (e.g., document-apartmentError)
      showFieldError(`document-${propertyTypeKey}Error`, 'لطفاً وضعیت سند را انتخاب کنید');
    } else {
      hideFieldError(`document-${propertyTypeKey}Error`);
    }

    // Validate Sale Conditions Checkbox
    const saleConditionsName = 'saleConditions';
    const saleConditionsSelector = `input[name="${saleConditionsName}"][id^="saleConditions-${propertyTypeKey}-"]:checked`;
    const saleConditionsChecked = document.querySelector(saleConditionsSelector);
    if (!saleConditionsChecked) {
      isValid = false;
      showFieldError(`saleConditions-${propertyTypeKey}Error`, 'حداقل یک شرط فروش را انتخاب کنید');
    } else {
      hideFieldError(`saleConditions-${propertyTypeKey}Error`);
    }
    return isValid;
  }

  // Returns the list of REQUIRED field IDs for a given property type key
  function getRequiredFieldsForPropertyType(propertyTypeKey) {
    // Ensure these IDs match exactly with your HTML input IDs
    const fields = {
      'apartment': ['unitArea-apartment', 'roomCount-apartment', 'buildYear-apartment', 'totalPrice-apartment', 'address-apartment'],
      'villa': ['landArea-villa', 'buildingArea-villa', 'roomCount-villa', 'buildYear-villa', 'price-villa', 'address-villa'],
      'land': ['landArea-land', 'landUsage', 'totalPrice-land', 'address-land'],
      'commercial': ['shopArea', 'totalPrice-commercial', 'address-commercial'],
      'old': ['landArea-old', 'buildingArea-old', 'totalPrice-old', 'address-old'],
      'presale-apartment': ['unitArea-presale-apartment', 'roomCount-presale-apartment', 'totalPrice-presale-apartment', 'address-presale-apartment'], // Progress validated in main validateForm
      'presale-villa': ['landArea-presale-villa', 'buildingArea-presale-villa', 'roomCount-presale-villa', 'floorCount-presale-villa', 'price-presale-villa', 'address-presale-villa'] // Progress validated in main validateForm
    };
    return fields[propertyTypeKey] || [];
  }

  // Helper to show a specific field error (associates with input and error span)
  function showFieldError(fieldOrErrorId, message) {
      let fieldId = fieldOrErrorId.endsWith('Error') ? fieldOrErrorId.replace('Error', '') : fieldOrErrorId;
      let errorElementId = fieldId + 'Error';

      const field = document.getElementById(fieldId);
      const errorElement = document.getElementById(errorElementId);

      field?.classList.add('error-field'); // Add red border to input/textarea
      if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.remove('hidden');
      }
  }

  // Helper to hide a specific field error
  function hideFieldError(fieldOrErrorId) {
      let fieldId = fieldOrErrorId.endsWith('Error') ? fieldOrErrorId.replace('Error', '') : fieldOrErrorId;
      let errorElementId = fieldId + 'Error';

      document.getElementById(fieldId)?.classList.remove('error-field'); // Remove red border
      const errorElement = document.getElementById(errorElementId);
      if (errorElement) {
          errorElement.classList.add('hidden');
          errorElement.textContent = '';
      }
  }

  // Helper function to get the internal key for property type
  function getSelectedPropertyTypeKey() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return null;
    const selectedType = selectedTypeInput.value;

    if (selectedType === 'پیش‌فروش') {
      const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
      if (!selectedPresaleTypeInput) return 'presale-base'; // Base type selected, subtype needed
      const selectedPresaleType = selectedPresaleTypeInput.value;
      return `presale-${selectedPresaleType === 'آپارتمان' ? 'apartment' : 'villa'}`;
    }

    const typeMap = { 'آپارتمان': 'apartment', 'ویلا': 'villa', 'زمین': 'land', 'تجاری / مغازه': 'commercial', 'کلنگی': 'old' };
    return typeMap[selectedType] || null;
  }


  // --- توابع جمع‌آوری اطلاعات (بر اساس کدی که قبلا بهتر کار می‌کرد) ---
  function collectFormData() {
    const selectedTypeValue = document.querySelector('input[name="propertyType"]:checked')?.value;
    const propertyTypeKey = getSelectedPropertyTypeKey();

    const data = {
      uniqueId,
      registrationDate: document.getElementById('registrationDate')?.value || 'نامشخص',
      propertyType: selectedTypeValue || 'نامشخص',
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      altPhone: document.getElementById('altPhone')?.value.trim() || 'وارد نشده'
    };

    if (propertyTypeKey && propertyTypeKey !== 'presale-base') {
        // Use the key directly to get values for radio/checkbox/text fields
        data.document = getSelectedRadioValue('document', propertyTypeKey) || 'وارد نشده';
        data.saleConditions = getCheckedValues('saleConditions', propertyTypeKey);
        data.saleConditionDetails = document.getElementById(`saleConditionDetails-${propertyTypeKey}`)?.value.trim() || 'ندارد';
        data.address = document.getElementById(`address-${propertyTypeKey}`)?.value.trim() || 'وارد نشده';

        // Define specific collectors for each type
        const collectionFunctions = {
            'apartment': collectApartmentData, 'villa': collectVillaData, 'land': collectLandData,
            'commercial': collectCommercialData, 'old': collectOldData,
            'presale-apartment': collectPresaleApartmentData, 'presale-villa': collectPresaleVillaData
        };

        // Collect common presale fields if applicable
        if (propertyTypeKey.startsWith('presale')) {
            data.presaleType = propertyTypeKey.includes('apartment') ? 'آپارتمان' : 'ویلا';
            data.projectProgress = document.getElementById('projectProgress')?.value.trim() || 'وارد نشده';
        }

        // Call the specific collection function
        if (collectionFunctions[propertyTypeKey]) {
            Object.assign(data, collectionFunctions[propertyTypeKey](propertyTypeKey));
        }
    } else if (propertyTypeKey === 'presale-base') {
        // Collect only progress if only base presale is selected
        data.projectProgress = document.getElementById('projectProgress')?.value.trim() || 'وارد نشده';
    }
    return data;
  }

  // Sub-collection functions (ensure IDs match HTML)
  function collectApartmentData(key) {
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || 'وارد نشده',
      unitArea: document.getElementById(`unitArea-${key}`)?.value.trim() || '',
      roomCount: document.getElementById(`roomCount-${key}`)?.value.trim() || '',
      buildYear: document.getElementById(`buildYear-${key}`)?.value.trim() || '',
      kitchen: getCheckedValues('kitchen', key),
      facilities: getCheckedValues('facilities', key),
      otherFacilities: document.getElementById(`otherFacilities-${key}`)?.value.trim() || 'ندارد',
      amenities: getCheckedValues('amenities', key),
      otherAmenities: document.getElementById(`otherAmenities-${key}`)?.value.trim() || 'ندارد',
      commonAreas: getCheckedValues('commonAreas', key),
      otherCommonAreas: document.getElementById(`otherCommonAreas-${key}`)?.value.trim() || 'ندارد',
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'ندارد',
      pricePerMeter: document.getElementById(`pricePerMeter-${key}`)?.value.trim() || 'وارد نشده',
      totalPrice: document.getElementById(`totalPrice-${key}`)?.value.trim() || '',
    };
  }
  function collectVillaData(key) {
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || '',
      buildingArea: document.getElementById(`buildingArea-${key}`)?.value.trim() || '',
      roomCount: document.getElementById(`roomCount-${key}`)?.value.trim() || '',
      buildYear: document.getElementById(`buildYear-${key}`)?.value.trim() || '',
      kitchen: getCheckedValues('kitchen', key),
      facilities: getCheckedValues('facilities', key),
      otherFacilities: document.getElementById(`otherFacilities-${key}`)?.value.trim() || 'ندارد',
      amenities: getCheckedValues('amenities', key),
      otherAmenities: document.getElementById(`otherAmenities-${key}`)?.value.trim() || 'ندارد',
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'ندارد',
      price: document.getElementById(`price-${key}`)?.value.trim() || '', // Villa uses 'price'
    };
  }
  function collectLandData(key) {    // Double-check if these fields need '-land' suffix or are unique
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || '',
      landUsage: document.getElementById('landUsage')?.value.trim() || '', // Assumed unique
      landWidth: document.getElementById('landWidth')?.value.trim() || 'وارد نشده', // Assumed unique
      landDepth: document.getElementById('landDepth')?.value.trim() || 'وارد نشده', // Assumed unique
      alleyWidth: document.getElementById('alleyWidth')?.value.trim() || 'وارد نشده', // Assumed unique
      enclosed: getSelectedRadioValue('enclosed', 'land') || 'وارد نشده', // Needs 'land' key
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'ندارد',
      pricePerMeter: document.getElementById(`pricePerMeter-${key}`)?.value.trim() || 'وارد نشده',
      totalPrice: document.getElementById(`totalPrice-${key}`)?.value.trim() || '',
    };
  }
  function collectCommercialData(key) {
    // Double-check if these fields need '-commercial' suffix or are unique
    return {
      shopArea: document.getElementById('shopArea')?.value.trim() || '', // Assumed unique
      shopHeight: document.getElementById('shopHeight')?.value.trim() || 'وارد نشده', // Assumed unique
      shopWidth: document.getElementById('shopWidth')?.value.trim() || 'وارد نشده', // Assumed unique
      shopDetails: document.getElementById('shopDetails')?.value.trim() || 'ندارد', // Assumed unique
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'وارد نشده', // Needs '-commercial' suffix
      pricePerMeter: document.getElementById(`pricePerMeter-${key}`)?.value.trim() || 'وارد نشده',
      totalPrice: document.getElementById(`totalPrice-${key}`)?.value.trim() || '',
    };
  }
  function collectOldData(key) {
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || '',
      buildingArea: document.getElementById(`buildingArea-${key}`)?.value.trim() || '',
      landWidth: document.getElementById(`landWidth-${key}`)?.value.trim() || 'وارد نشده',
      landDepth: document.getElementById(`landDepth-${key}`)?.value.trim() || 'وارد نشده',
      livability: getSelectedRadioValue('livability', 'old') || 'وارد نشده', // Needs 'old' key
      utilities: getCheckedValues('utilities', 'old'), // Needs 'old' key
      amenities: document.getElementById(`amenities-${key}`)?.value.trim() || 'ندارد', // Textarea
      pricePerMeter: document.getElementById(`pricePerMeter-${key}`)?.value.trim() || 'وارد نشده',
      totalPrice: document.getElementById(`totalPrice-${key}`)?.value.trim() || '',
    };
  }
  function collectPresaleApartmentData(key) { // key is 'presale-apartment'
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || 'وارد نشده',
      unitArea: document.getElementById(`unitArea-${key}`)?.value.trim() || '',
      roomCount: document.getElementById(`roomCount-${key}`)?.value.trim() || '',
      floorCount: document.getElementById(`floorCount-${key}`)?.value.trim() || 'وارد نشده',
      floorNumber: document.getElementById(`floorNumber-${key}`)?.value.trim() || 'وارد نشده',
      unitsPerFloor: document.getElementById(`unitsPerFloor-${key}`)?.value.trim() || 'وارد نشده',
      moreDetails: document.getElementById(`moreDetails-${key}`)?.value.trim() || 'ندارد',
      kitchen: getCheckedValues('kitchen', key),
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'ندارد',
      pricePerMeter: document.getElementById(`pricePerMeter-${key}`)?.value.trim() || 'وارد نشده',
      totalPrice: document.getElementById(`totalPrice-${key}`)?.value.trim() || '',
    };
  }
  function collectPresaleVillaData(key) { // key is 'presale-villa'
    return {
      landArea: document.getElementById(`landArea-${key}`)?.value.trim() || '',
      buildingArea: document.getElementById(`buildingArea-${key}`)?.value.trim() || '',
      roomCount: document.getElementById(`roomCount-${key}`)?.value.trim() || '',
      floorCount: document.getElementById(`floorCount-${key}`)?.value.trim() || '',
      kitchen: getCheckedValues('kitchen', key),
      otherDetails: document.getElementById(`otherDetails-${key}`)?.value.trim() || 'ندارد',
      price: document.getElementById(`price-${key}`)?.value.trim() || '', // Presale villa uses 'price'
    };
  }


  // Helper to get checked checkbox values, requires name and the *internal* property type key
  function getCheckedValues(name, propertyTypeKey) {
      // Assumes ID structure like: kitchen-apartment-gas, kitchen-apartment-hood
      const selector = `input[name="${name}"][id^="${name}-${propertyTypeKey}-"]:checked`;
      const checkboxes = document.querySelectorAll(selector);
      if (checkboxes.length === 0) return 'هیچکدام';
      return Array.from(checkboxes).map(cb => cb.value).join('، ');
  }

  // Helper to get selected radio value, requires name and the *internal* property type key
  function getSelectedRadioValue(name, propertyTypeKey) {
      // Assumes ID structure like: document-apartment-singleDoc
      const selector = `input[name="${name}"][id^="${name}-${propertyTypeKey}-"]:checked`;
      const radio = document.querySelector(selector);
      return radio ? radio.value : '';
  }


  // --- تابع ارسال ایمیل (با Service ID و Public Key نهایی) ---
  async function sendEmail(formData) {
    const formatPrice = (priceString) => {
      if (!priceString || priceString === 'وارد نشده' || String(priceString).trim() === '') return 'وارد نشده';
      const numericValue = unformatNumber(priceString);
      return isNaN(numericValue) ? 'نامعتبر' : formatNumber(numericValue) + " تومان";
    };
    const formatMetric = (value, unit = '') => {
         if (!value || value === 'وارد نشده' || String(value).trim() === '') return 'وارد نشده';
         return String(value).trim() + (unit ? ` ${unit}` : '');
     };

    const templateParams = {      to_name: "املاک معین",
      subject: `ثبت ملک جدید (${formData.propertyType}) - ${formData.firstName} ${formData.lastName}`,
      reply_to: "no-reply@example.com", // EmailJS uses the sender email configured in the service
      unique_id: formData.uniqueId,
      registration_date: formData.registrationDate || 'نامشخص',
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      altPhone: formData.altPhone || 'وارد نشده',
      property_type: formData.propertyType,
      documentType: formData.document || 'وارد نشده',
      address: formData.address || 'وارد نشده',
      saleConditions: formData.saleConditions || 'هیچکدام',
      saleConditionDetails: formData.saleConditionDetails || 'ندارد',
      price: formatPrice(formData.price), // Primarily for villa types
      totalPrice: formatPrice(formData.totalPrice), // For most other types
      pricePerMeter: formatPrice(formData.pricePerMeter), // For types where applicable
      presaleType: formData.presaleType || '',
      projectProgress: formData.projectProgress ? formatMetric(formData.projectProgress, '%') : '',
      // Initialize detail strings (ensure these match your EmailJS template variables)
      apartmentDetails: '', villaDetails: '', landDetails: '', commercialDetails: '',
      oldDetails: '', presaleApartmentDetails: '', presaleVillaDetails: ''
    };

    // Populate the correct detail string based on propertyTypeKey
    const propertyTypeKey = getSelectedPropertyTypeKey();
    if (propertyTypeKey && propertyTypeKey !== 'presale-base') {
        const detailFormatters = {
            'apartment': formatApartmentDetailsForEmail, 'villa': formatVillaDetailsForEmail,
            'land': formatLandDetailsForEmail, 'commercial': formatCommercialDetailsForEmail,
            'old': formatOldDetailsForEmail,
            'presale-apartment': formatPresaleApartmentDetailsForEmail,
            'presale-villa': formatPresaleVillaDetailsForEmail
        };
        if (detailFormatters[propertyTypeKey]) {
            // Construct the template variable name (e.g., presaleapartmentDetails or apartmentDetails)
            const detailParamKey = propertyTypeKey.replace('-', '') + 'Details';
            if (templateParams.hasOwnProperty(detailParamKey)) { // Check if combined key exists
                templateParams[detailParamKey] = detailFormatters[propertyTypeKey](formData, formatMetric);
            } else if (templateParams.hasOwnProperty(propertyTypeKey + 'Details')) { // Check if simple key exists
                 templateParams[propertyTypeKey + 'Details'] = detailFormatters[propertyTypeKey](formData, formatMetric);
             }
        }
    }

    console.log("Final templateParams being sent:", templateParams);

    // ======================================================
    // ========== ارسال با شناسه‌های نهایی و صحیح ==========
    // ======================================================
    return emailjs.send(
        "service_rds9l25",      // <<-- *** Service ID صحیح با 'l' کوچک ***
        "template_5do0c0n",     // <<-- Template ID صحیح
        templateParams
    );
    // ======================================================
  }

    // --- Email Detail Formatting Functions (کامل) ---
    function formatApartmentDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ واحد: ${formatMetric(data.unitArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `سال ساخت: ${formatMetric(data.buildYear)}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}${data.otherFacilities && data.otherFacilities !== 'ندارد' ? ` (${data.otherFacilities})` : ''}\n`;
        details += `امکانات: ${data.amenities || 'وارد نشده'}${data.otherAmenities && data.otherAmenities !== 'ندارد' ? ` (${data.otherAmenities})` : ''}\n`;
        details += `مشاعات: ${data.commonAreas || 'وارد نشده'}${data.otherCommonAreas && data.otherCommonAreas !== 'ندارد' ? ` (${data.otherCommonAreas})` : ''}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}`;
        return details.trim();
    }
    function formatVillaDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنا: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `سال ساخت: ${formatMetric(data.buildYear)}\n\n`;
        details += `مشخصات آشپزخانه: ${data.kitchen || 'وارد نشده'}\n`;
        details += `تاسیسات: ${data.facilities || 'وارد نشده'}${data.otherFacilities && data.otherFacilities !== 'ندارد' ? ` (${data.otherFacilities})` : ''}\n`;
        details += `امکانات ویلا: ${data.amenities || 'وارد نشده'}${data.otherAmenities && data.otherAmenities !== 'ندارد' ? ` (${data.otherAmenities})` : ''}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}`;
        return details.trim();
    }
    function formatLandDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `کاربری: ${data.landUsage || 'وارد نشده'}\n`;
        details += `بَر زمین: ${formatMetric(data.landWidth, 'متر')}\n`;
        details += `عمق زمین: ${formatMetric(data.landDepth, 'متر')}\n`;
        details += `عرض کوچه: ${formatMetric(data.alleyWidth, 'متر')}\n`;
        details += `محصور: ${data.enclosed || 'وارد نشده'}\n\n`;
        details += `سایر توضیحات: ${data.otherDetails || 'ندارد'}`;
        return details.trim();
    }
    function formatCommercialDetailsForEmail(data, formatMetric) {
        let details = `متراژ مغازه: ${formatMetric(data.shopArea, 'متر')}\n`;
        details += `ارتفاع مغازه: ${formatMetric(data.shopHeight, 'متر')}\n`;
        details += `دهنه مغازه: ${formatMetric(data.shopWidth, 'متر')}\n`;
        details += `توضیحات شکل: ${data.shopDetails || 'ندارد'}\n\n`;
        details += `امکانات مغازه: ${data.otherDetails || 'وارد نشده'}`;
        return details.trim();
    }
    function formatOldDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنای موجود: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `بَر زمین: ${formatMetric(data.landWidth, 'متر')}\n`;
        details += `عمق زمین: ${formatMetric(data.landDepth, 'متر')}\n`;
        details += `وضعیت سکونت بنا: ${data.livability || 'وارد نشده'}\n`;
        details += `امتیازات موجود: ${data.utilities || 'وارد نشده'}\n`;
        details += `امکانات بنای موجود: ${data.amenities || 'ندارد'}`;
        return details.trim();
    }
    function formatPresaleApartmentDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین پروژه: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ واحد: ${formatMetric(data.unitArea, 'متر')}\n`;
        details += `تعداد اتاق: ${formatMetric(data.roomCount)}\n`;
        details += `تعداد کل طبقات: ${formatMetric(data.floorCount)}\n`;
        details += `طبقه واحد: ${formatMetric(data.floorNumber)}\n`;
        details += `تعداد واحد در طبقه: ${formatMetric(data.unitsPerFloor)}\n\n`;
        details += `توضیحات بیشتر پروژه: ${data.moreDetails || 'ندارد'}\n`;
        details += `مشخصات آشپزخانه (تحویلی): ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات/امکانات (تحویلی): ${data.otherDetails || 'ندارد'}`;
        return details.trim();
    }
    function formatPresaleVillaDetailsForEmail(data, formatMetric) {
        let details = `متراژ زمین: ${formatMetric(data.landArea, 'متر')}\n`;
        details += `متراژ بنا: ${formatMetric(data.buildingArea, 'متر')}\n`;
        details += `تعداد اتاق‌ها: ${formatMetric(data.roomCount)}\n`;
        details += `تعداد طبقات: ${formatMetric(data.floorCount)}\n\n`;
        details += `مشخصات آشپزخانه (تحویلی): ${data.kitchen || 'وارد نشده'}\n`;
        details += `سایر توضیحات/امکانات (تحویلی): ${data.otherDetails || 'ندارد'}`;
        return details.trim();
    }


  // --- توابع مدیریت Overlay ها و صدا و ... (بدون تغییر) ---
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString(36);
  }

  function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound?.play().catch(e => console.warn("Sound play failed/interrupted:", e));
  }

  function showSendingOverlayWithProgress() {
    const sendingOverlay = document.getElementById('sendingOverlay');
    if (!sendingOverlay) return;
    const overlayContent = sendingOverlay.querySelector('.overlay-content');
    if (!overlayContent) return;
    // Ensure progress bar container exists or create it
    let progressContainer = document.getElementById('sendingProgressContainer');
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.id = 'sendingProgressContainer';
        progressContainer.className = 'progress mt-3';
        progressContainer.style.height = '20px';
        progressContainer.style.backgroundColor = '#e9ecef';
        progressContainer.innerHTML = `<div id="sendingProgressBar" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%; transition: width 0.1s linear;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>`;
        // Append it after the main text in the sending overlay
        const sendingText = overlayContent.querySelector('p');
        sendingText?.parentNode.insertBefore(progressContainer, sendingText.nextSibling);
    }
    // Reset progress bar
    const progressBar = document.getElementById('sendingProgressBar');
    if(progressBar) {
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', 0);
    }
    showOverlay('sendingOverlay');
  }

  function showSuccessOverlay() {
    const uniqueIdDisplay = document.getElementById('uniqueIdDisplay');
    if (uniqueIdDisplay) uniqueIdDisplay.textContent = uniqueId;
    showOverlay('successOverlay');
  }

  function showErrorOverlay() { showOverlay('errorOverlay'); }
  function showConfirmOverlay() { showOverlay('confirmOverlay'); }
  function hideConfirmOverlay() { hideOverlay('confirmOverlay'); }
  function hideSuccessOverlay() { hideOverlay('successOverlay'); resetForm(); }
  function hideErrorOverlay() { hideOverlay('errorOverlay'); }
  function showMenuOverlay() { showOverlay('menuOverlay'); }
  function hideMenuOverlay() { hideOverlay('menuOverlay'); }

  function showOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.style.display = 'flex';
  }
  function hideOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.style.display = 'none';
  }

  // پاک کردن فرم (نسخه کامل‌تر)
  function resetForm() {
    const form = document.getElementById('propertyForm');
    if (!form) return;
    form.reset();

    // Hide all dynamic sections
    Object.values(detailSections).forEach(section => section?.classList.add('hidden'));
    Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));

    // Clear all errors
    document.querySelectorAll('.error').forEach(el => { el.classList.add('hidden'); el.textContent = ''; });
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    document.getElementById('validationErrors')?.classList.add('hidden');
    document.getElementById('errorsList')?.replaceChildren(); // Clear error list

    // Regenerate unique ID and reset date
    uniqueId = generateUniqueId();
    setJalaliDate();

    // Hide confirmation overlay if it was open
    hideConfirmOverlay();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}); // End of DOMContentLoaded