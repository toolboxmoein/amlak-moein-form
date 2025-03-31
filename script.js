document.addEventListener('DOMContentLoaded', function() {
  // ======================================================
  // ========== تنظیمات EmailJS (بدون تغییر) ==========
  // این بخش بدون تغییر است
  (function() {
    // اطمینان از وجود EmailJS قبل از استفاده
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init({
              publicKey: "7zOCMQKl0bRjmv6cn" // <<-- Public Key شما
            });
            console.log("EmailJS Initialized Successfully.");
        } catch (initError) {
            console.error("EmailJS Initialization Failed:", initError);
            alert("خطا در بارگذاری اولیه سرویس ایمیل. لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.");
        }
    } else {
        console.error("EmailJS library not loaded before initialization attempt.");
        alert("کتابخانه ایمیل بارگذاری نشده است. لطفاً اتصال اینترنت خود را بررسی کرده و صفحه را رفرش کنید.");
    }
  })();
  // ======================================================

  // متغیرهای سراسری
  // این بخش بدون تغییر است
  let uniqueId = generateUniqueId();

  // انتخابگرهای عناصر DOM (برای دسترسی آسان‌تر)
  // این بخش بدون تغییر است
  const registrationDateField = document.getElementById('registrationDate');
  const propertyForm = document.getElementById('propertyForm');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuCloseBtn = document.getElementById('menuClose');
  const resetBtn = document.getElementById('resetBtn');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const closeErrorBtn = document.getElementById('closeErrorBtn');
  const validationErrorsContainer = document.getElementById('validationErrors');
  const errorsList = document.getElementById('errorsList');
  const sendingOverlay = document.getElementById('sendingOverlay');
  const successOverlay = document.getElementById('successOverlay');
  const errorOverlay = document.getElementById('errorOverlay');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const menuOverlay = document.getElementById('menuOverlay');
  const progressBar = document.getElementById('progressBar');

  // نمایش و مخفی کردن بخش‌های مختلف فرم بر اساس نوع ملک
  // این بخش بدون تغییر است
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
  // این بخش بدون تغییر است
  function setJalaliDate() {
    try {
        const today = new Date();        const options = { year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'persian', timeZone: 'Asia/Tehran' };
        const persianDate = today.toLocaleDateString('fa-IR-u-nu-latn', options).replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3');
        if (registrationDateField) { registrationDateField.value = persianDate; }
    } catch (error) {
        console.error("Error setting Jalali date:", error);
        if (registrationDateField) { registrationDateField.placeholder = "خطا در دریافت تاریخ"; }
    }
  }

  // ******** فراخوانی تابع تنظیم تاریخ شمسی در ابتدا ********
  // این بخش بدون تغییر است
  setJalaliDate();

  // تنظیم رویدادها  // این بخش بدون تغییر است
  setupEventListeners();
  setupNumericInputs();

  // تنظیم فیلدهای عددی برای کیبورد مخصوص اعداد
  // این بخش بدون تغییر است
  function setupNumericInputs() {
    document.querySelectorAll('.numeric-only, .price-input').forEach(input => {
      input.setAttribute('inputmode', 'numeric');
    });
  }

  // تنظیم رویدادهای فرم
  // این بخش بدون تغییر است (منطق داخلی برخی event ها تغییر کرده)
  function setupEventListeners() {
     console.log("Setting up event listeners...");
    if (!propertyForm) { console.error("Form element #propertyForm not found!"); return; }

    propertyTypeRadios.forEach(radio => radio.addEventListener('change', handlePropertyTypeChange));
    presaleTypeRadios.forEach(radio => radio.addEventListener('change', handlePresaleTypeChange));

    // --- Input Formatters ---
    document.querySelectorAll('.numeric-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^0-9۰-۹]/g, ''); });
    });
    document.querySelectorAll('.persian-letters-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^آ-یءچحجژ\s]/g, ''); });
    });
    document.querySelectorAll('.persian-and-numbers-only').forEach(input => {
      input.addEventListener('input', function() { this.value = this.value.replace(/[^آ-یءچحجژ0-9۰-۹\s.,()\-]/g, ''); });
    });
    document.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('input', function(e) {
        let value = this.value.replace(/[^\d۰-۹]/g, '');
        this.value = value ? formatNumber(value) : '';
      });
    });

    // --- Auto Price Calculations ---
    document.getElementById('unitArea-apartment')?.addEventListener('input', calculateApartmentTotalPrice);
    document.getElementById('pricePerMeter-apartment')?.addEventListener('input', calculateApartmentTotalPrice);
    document.getElementById('landArea-land')?.addEventListener('input', calculateLandTotalPrice);
    document.getElementById('pricePerMeter-land')?.addEventListener('input', calculateLandTotalPrice);
    document.getElementById('shopArea')?.addEventListener('input', calculateCommercialTotalPrice);
    document.getElementById('pricePerMeter-commercial')?.addEventListener('input', calculateCommercialTotalPrice);
    document.getElementById('unitArea-presale-apartment')?.addEventListener('input', calculatePresaleApartmentTotalPrice);
    document.getElementById('pricePerMeter-presale-apartment')?.addEventListener('input', calculatePresaleApartmentTotalPrice);
    // Add other auto-calculations if needed

    // --- Button Listeners ---
    if (resetBtn) { resetBtn.addEventListener('click', showConfirmOverlay); console.log("Reset button listener attached."); } else console.error("Reset button not found");
    if (confirmYesBtn) confirmYesBtn.addEventListener('click', resetForm); else console.error("Confirm Yes button not found");
    if (confirmNoBtn) confirmNoBtn.addEventListener('click', hideConfirmOverlay); else console.error("Confirm No button not found");
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', hideSuccessOverlay); else console.error("Close Success button not found");
    if (closeErrorBtn) closeErrorBtn.addEventListener('click', hideErrorOverlay); else console.error("Close Error button not found");

    // --- Menu Listeners ---
    if (hamburgerMenu) hamburgerMenu.addEventListener('click', showMenuOverlay); else console.error("Hamburger menu button not found");    if (menuCloseBtn) menuCloseBtn.addEventListener('click', hideMenuOverlay); else console.error("Menu close button not found");

    // --- Form Submission ---
    propertyForm.addEventListener('submit', handleFormSubmit);
    console.log("Form submit listener attached.");

    // --- Live Validation / Error Clearing ---
    // Clear basic input errors on input
    document.querySelectorAll('input[required], textarea[required]').forEach(input => {
      input.addEventListener('input', function() {
          if (this.value.trim() !== '') {
              hideFieldError(this.id);
              checkAndHideErrorsContainer();
          }
      });
    });

    // Clear checkbox group errors on change (** propertyStatus and saleConditions **)
    document.querySelectorAll('input[type="checkbox"][name="propertyStatus"], input[type="checkbox"][name="saleConditions"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const propertyTypeKey = getSelectedPropertyTypeKey();
            if (!propertyTypeKey) return;

            const groupContainerId = this.name === 'propertyStatus' ? `propertyStatusGroup-${propertyTypeKey}` : `saleConditionsGroup-${propertyTypeKey}`;
            const groupContainer = document.getElementById(groupContainerId);
            const errorId = this.name === 'propertyStatus' ? `propertyStatus-${propertyTypeKey}Error` : `saleConditions-${propertyTypeKey}Error`;

            // Check if at least one checkbox in *this specific group* within the *currently visible section* is checked
            const sectionElement = getVisibleDetailSectionElement(); // Helper to get the active section
            if (sectionElement) {
                const anyChecked = sectionElement.querySelector(`input[name="${this.name}"]:checked`);
                if (anyChecked) {
                    hideFieldError(errorId); // Hide the error message div
                    groupContainer?.classList.remove('error-field'); // Remove highlight from the group div
                }
            }
            checkAndHideErrorsContainer(); // Check if the main error box needs hiding
        });
    });    // Clear radio button errors on change
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', function() {
          // Specific error IDs for radio groups
          if (this.name === 'propertyType') hideFieldError('typeError');          else if (this.name === 'presaleType') hideFieldError('presaleTypeError');
          else {
                // For other radio groups (like occupancyStatus, buildingFacade, etc.)
                const propertyTypeKey = getSelectedPropertyTypeKey();
                if (propertyTypeKey) {
                    const errorId = `${this.name}-${propertyTypeKey}Error`; // Assuming error ID follows pattern
                    hideFieldError(errorId);
                    // Optional: remove error class from container if needed
                     const errorElement = document.getElementById(errorId);
                     errorElement?.closest('.form-check-group, .mt-4')?.classList.remove('error-field');
                }
          }
          checkAndHideErrorsContainer();
      });
    });

    console.log("Other input/change listeners attached.");
  }

  // --- Helper: Get currently visible detail section element ---
  // این بخش بدون تغییر است
  function getVisibleDetailSectionElement() {
      for (const key in detailSections) {
          if (detailSections[key] && !detailSections[key].classList.contains('hidden')) {
              // If it's the presale base section, check the subtype
              if (key === 'پیش‌فروش') {
                  for (const presaleKey in presaleDetailSections) {
                      if (presaleDetailSections[presaleKey] && !presaleDetailSections[presaleKey].classList.contains('hidden')) {
                          return presaleDetailSections[presaleKey];
                      }
                  }
                  return detailSections[key]; // Return presaleTypeSection if no subtype visible yet
              }
              return detailSections[key];
          }
      }
      return null; // Should not happen if type is selected
  }


  // --- توابع کمکی فرمت و نمایش/مخفی‌سازی ---
  // این بخش بدون تغییر است
  function toPersianDigits(n) {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return String(n).replace(/\d/g, d => persianDigits[d]);
  }
  function toEnglishDigits(s) {
      if (typeof s !== 'string') return s;
      const persianDigits = /[\u06F0-\u06F9]/g;
      const arabicDigits = /[\u0660-\u0669]/g;
      return s.replace(persianDigits, c => c.charCodeAt(0) - 0x06F0)
              .replace(arabicDigits, c => c.charCodeAt(0) - 0x0660);
  }
  function formatNumber(num) {
    num = String(num).replace(/,/g, '');
    num = toEnglishDigits(num);
    if (isNaN(parseInt(num))) return '';
    const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return toPersianDigits(formatted);
  }
  function unformatNumber(formattedNum) {
    if (typeof formattedNum !== 'string') return NaN;
    const englishNum = toEnglishDigits(formattedNum.replace(/,/g, ''));
    return parseInt(englishNum, 10);
  }
  function checkAndHideErrorsContainer() {
    if (!errorsList || !validationErrorsContainer) return;    const visibleErrors = document.querySelectorAll('.error:not(.hidden)');
    if (visibleErrors.length === 0 && errorsList.children.length === 0) {
      validationErrorsContainer.classList.add('hidden');
    }
  }

  // --- توابع محاسبه قیمت ---
  // این بخش بدون تغییر است
  function calculateApartmentTotalPrice() { const unitArea = document.getElementById('unitArea-apartment')?.value.trim(); const pricePerMeter = document.getElementById('pricePerMeter-apartment')?.value.trim(); const totalPriceField = document.getElementById('totalPrice-apartment'); if (totalPriceField && unitArea && pricePerMeter) { const area = unformatNumber(unitArea); const price = unformatNumber(pricePerMeter); if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) { totalPriceField.value = formatNumber(String(area * price)); hideFieldError('totalPrice-apartment'); } } }
  function calculateLandTotalPrice() { const landArea = document.getElementById('landArea-land')?.value.trim(); const pricePerMeter = document.getElementById('pricePerMeter-land')?.value.trim(); const totalPriceField = document.getElementById('totalPrice-land'); if (totalPriceField && landArea && pricePerMeter) { const area = unformatNumber(landArea); const price = unformatNumber(pricePerMeter); if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) { totalPriceField.value = formatNumber(String(area * price)); hideFieldError('totalPrice-land'); } } }
  function calculateCommercialTotalPrice() { const shopArea = document.getElementById('shopArea')?.value.trim(); const pricePerMeter = document.getElementById('pricePerMeter-commercial')?.value.trim(); const totalPriceField = document.getElementById('totalPrice-commercial'); if (totalPriceField && shopArea && pricePerMeter) { const area = unformatNumber(shopArea); const price = unformatNumber(pricePerMeter); if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) { totalPriceField.value = formatNumber(String(area * price)); hideFieldError('totalPrice-commercial'); } } }
  function calculatePresaleApartmentTotalPrice() { const unitArea = document.getElementById('unitArea-presale-apartment')?.value.trim(); const pricePerMeter = document.getElementById('pricePerMeter-presale-apartment')?.value.trim(); const totalPriceField = document.getElementById('totalPrice-presale-apartment'); if (totalPriceField && unitArea && pricePerMeter) { const area = unformatNumber(unitArea); const price = unformatNumber(pricePerMeter); if (!isNaN(area) && !isNaN(price) && area > 0 && price > 0) { totalPriceField.value = formatNumber(String(area * price)); hideFieldError('totalPrice-presale-apartment'); } } }
  // Add calculateVillaTotalPrice, calculateOldTotalPrice, calculatePresaleVillaTotalPrice if needed


  // --- توابع مدیریت نمایش بخش‌ها ---
  // این بخش بدون تغییر است
  function handlePropertyTypeChange() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return;
    const selectedType = selectedTypeInput.value;
    Object.values(detailSections).forEach(section => section?.classList.add('hidden'));
    Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));
    if (detailSections[selectedType]) {
      detailSections[selectedType].classList.remove('hidden');
      if (selectedType === 'پیش‌فروش') {
          Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));
      } else {
          detailSections['پیش‌فروش']?.classList.add('hidden');
      }
    }
    hideFieldError('typeError');
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
    hideFieldError('presaleTypeError');
    playSound('dingSound');
  }

  // --- تابع اصلی ارسال فرم ---
  // این بخش تغییر کرده (مدیریت خطای EmailJS)
  async function handleFormSubmit(e) {
    e.preventDefault();
    console.log("Form submit triggered.");
    clearAllErrors();

    if (!validateForm()) {
        console.log("Form validation failed.");
        playSound('errorSound');
        validationErrorsContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    console.log("Form validation passed. Attempting to send email...");
    showSendingOverlayWithProgress();
    simulateProgress(); // Start progress bar simulation

    // اطمینان مجدد از وجود EmailJS
    if (typeof emailjs === 'undefined') {
        console.error("EmailJS object is not defined. Cannot send email.");
        hideOverlay('sendingOverlay');
        const errorMsgElement = document.querySelector('#errorOverlay #errorMessage');
        if (errorMsgElement) { errorMsgElement.textContent = "خطا: سرویس ارسال ایمیل به درستی بارگذاری نشده است. لطفاً صفحه را رفرش کنید."; }
        showErrorOverlay();
        playSound('errorSound');
        return;
    }

    try {
      const formData = collectFormData();
      console.log("Collected form data for EmailJS:", formData); // Log data before sending
      await sendEmail(formData);
      console.log("EmailJS send successful (promise resolved).");
      // Ensure progress finishes before hiding overlay
      // await new Promise(resolve => setTimeout(resolve, 200)); // Short delay
      hideOverlay('sendingOverlay');
      showSuccessOverlay();
      playSound('successSound');
    } catch (error) {
      console.error("EmailJS Send Error:", error); // Log the full error object
      hideOverlay('sendingOverlay');
      const errorMsgElement = document.querySelector('#errorOverlay #errorMessage');
      let userErrorMessage = "متاسفانه مشکلی در هنگام ثبت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.";

      // Detailed error handling based on EmailJS error object
      if (error && typeof error === 'object') {
          // Check for common status codes and messages
          if (error.status === 400) {
                // Specific 400 errors based on EmailJS documentation/common issues
                if (error.text?.includes("service ID is invalid")) userErrorMessage = "خطا: شناسه سرویس EmailJS نامعتبر است (Service ID). لطفاً با مدیر سایت تماس بگیرید.";
                else if (error.text?.includes("template ID is invalid")) userErrorMessage = "خطا: شناسه قالب EmailJS نامعتبر است (Template ID). لطفاً با مدیر سایت تماس بگیرید.";
                else if (error.text?.includes("user_id parameter is required") || error.text?.includes("template_params parameter is required")) userErrorMessage = "خطا: پارامترهای ضروری برای ارسال ایمیل (مانند کلید عمومی یا پارامترهای قالب) ارسال نشده‌اند. لطفاً با مدیر سایت تماس بگیرید.";
                else if (error.text?.includes("template_params parameter is invalid") || error.text?.includes("Invalid JSON")) userErrorMessage = "خطا: داده‌های ارسال شده به قالب ایمیل نامعتبر است یا با متغیرهای قالب تطابق ندارد. لطفاً با مدیر سایت تماس بگیرید.";
                else if (error.text?.includes("The recipient address is invalid")) userErrorMessage = "خطا: آدرس ایمیل گیرنده (پیکربندی شده در EmailJS) نامعتبر است. لطفاً با مدیر سایت تماس بگیرید.";
                else userErrorMessage = `خطا در داده‌های ارسالی (کد: 400). لطفاً مقادیر فرم را بررسی کنید یا با مدیر سایت تماس بگیرید. جزئیات: ${error.text || 'نامشخص'}`; // Generic 400
                console.error("EmailJS Error Details (400):", error.text);
          } else if (error.status === 403 && error.text?.includes("The user is blocked")) {
                userErrorMessage = "خطا: ارسال ایمیل مسدود شده است (احتمالا به دلیل محدودیت‌های سرویس). لطفاً با مدیر سایت تماس بگیرید.";
                console.error("EmailJS Error Details (403 - Blocked):", error.text);
          } else if (error.status === 404 && error.text?.includes("The user is not found")) { // Check specific text for public key error
                userErrorMessage = "خطا: کلید عمومی (Public Key) EmailJS نامعتبر یا یافت نشد. لطفاً با مدیر سایت تماس بگیرید.";
                console.error("EmailJS Error Details (404 - Public Key):", error.text);
          } else if (error.status > 0) {
                // Other HTTP errors
                userErrorMessage = `خطا در ارتباط با سرور ایمیل (کد: ${error.status}). لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.`;
                console.error(`EmailJS Error Details (${error.status}):`, error.text || error);
          } else {
                // Network errors or others before getting a status
                userErrorMessage = "خطای شبکه یا عدم دسترسی به سرویس ایمیل. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.";
                console.error("EmailJS Network/Other Error:", error.text || error);
          }
      } else {
          // Unexpected errors (not standard EmailJS error object)
          console.error("Unexpected Error during send:", error);
          userErrorMessage = "خطای غیرمنتظره در ارسال اطلاعات رخ داد.";
      }

      if (errorMsgElement) { errorMsgElement.textContent = userErrorMessage; }
      showErrorOverlay();
      playSound('errorSound');
    }
  }

  // شبیه‌سازی پیشرفت
  // این بخش بدون تغییر است
  async function simulateProgress() {
     if (!progressBar) return;
    progressBar.style.width = '0%';
    progressBar.textContent = '۰٪';
    progressBar.setAttribute('aria-valuenow', 0);    const totalDuration = 1500;
    const interval = 50;
    const steps = totalDuration / interval;
    const increment = 100 / steps;

    for (let i = 0; i <= 100; i += increment) {
        if (!sendingOverlay || sendingOverlay.style.display === 'none') break;
        const currentWidth = Math.min(i, 100);
        progressBar.style.width = currentWidth + '%';
        progressBar.textContent = toPersianDigits(Math.round(currentWidth)) + '٪';
        progressBar.setAttribute('aria-valuenow', currentWidth);
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    if (sendingOverlay && sendingOverlay.style.display !== 'none' && progressBar) {
        progressBar.style.width = '100%';
        progressBar.textContent = '۱۰۰٪';
        progressBar.setAttribute('aria-valuenow', 100);
     }
  }

  // --- توابع اعتبارسنجی ---

  // پاک کردن تمام خطاها
  // این بخش بدون تغییر است
  function clearAllErrors() {
      document.querySelectorAll('.error').forEach(el => { el.classList.add('hidden'); el.textContent = ''; });
      document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
      // Remove error class from group containers explicitly
      document.querySelectorAll('.form-check-group.error-field').forEach(el => el.classList.remove('error-field'));
      validationErrorsContainer?.classList.add('hidden');
      if (errorsList) errorsList.innerHTML = ''; // Clear summary list
  }

  // اعتبارسنجی کل فرم
  // این بخش تغییر کرده (برای بررسی presale-base)
  function validateForm() {
    let isValid = true;
    const errors = []; // Collect user-friendly error *field names* for the summary box

    console.log("Starting form validation...");

    // --- Basic Info Validation ---
    if (!validateField('firstName', 'نام را وارد کنید')) { isValid = false; errors.push('نام'); }
    if (!validateField('lastName', 'نام خانوادگی را وارد کنید')) { isValid = false; errors.push('نام خانوادگی'); }
    if (!validateField('phone', 'شماره تماس را وارد کنید')) { isValid = false; errors.push('شماره تماس'); }
    else if (!validatePhone('phone')) { isValid = false; errors.push('شماره تماس (فرمت)'); }
    const altPhoneField = document.getElementById('altPhone');
    if (altPhoneField && altPhoneField.value.trim() !== '' && !validatePhone('altPhone')) {
        isValid = false; errors.push('شماره تماس دیگر (فرمت)');
    }    // --- Property Type Validation ---
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) {
      showFieldError('typeError', 'لطفاً نوع ملک را انتخاب کنید');
      isValid = false; errors.push('نوع ملک');
    } else {
      const propertyTypeKey = getSelectedPropertyTypeKey(); // 'apartment', 'presale-base', 'presale-villa' etc.
      console.log("Selected propertyTypeKey:", propertyTypeKey);

      if (!propertyTypeKey) {
          isValid = false; errors.push('خطای داخلی: نوع ملک نامشخص');
          console.error("Could not determine propertyTypeKey.");
      } else if (propertyTypeKey === 'presale-base') { // Presale selected, but subtype not yet
          console.log("Validating presale base...");
          const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
          if (!selectedPresaleTypeInput) {
             showFieldError('presaleTypeError', 'لطفاً نوع پیش‌فروش را انتخاب کنید');
             isValid = false; errors.push('نوع پیش‌فروش');
          } else {
             // Validate progress field which is common to all presales
             if (!validateField('projectProgress', 'پیشرفت پروژه را وارد کنید')) { isValid = false; errors.push('پیشرفت پروژه'); }
             // Now get the specific presale key (e.g., 'presale-apartment') for detail validation
             const specificPresaleKey = getSelectedPropertyTypeKey(); // Re-evaluate to get specific key
             console.log("Specific presale key:", specificPresaleKey);
             if (specificPresaleKey && specificPresaleKey !== 'presale-base') {
                 if (!validatePropertyType(specificPresaleKey)) { // Validate details of the specific presale type
                     isValid = false;
                     // Specific field errors are added within validatePropertyType
                     console.log(`Validation failed for specific presale type: ${specificPresaleKey}`);
                 }
             } else if (!specificPresaleKey) {
                 isValid = false; errors.push('خطای داخلی: نوع پیش‌فروش نامشخص');
                 console.error("Could not determine specific presale key after selecting subtype.");
             }
          }
      } else { // For non-presale types or specific presale types (e.g., 'presale-apartment')
          console.log(`Validating details for type: ${propertyTypeKey}`);
          if (!validatePropertyType(propertyTypeKey)) {
              isValid = false;              // Specific field errors are added within validatePropertyType
              console.log(`Validation failed for type: ${propertyTypeKey}`);
          }
      }
    }

    // --- Display Errors Summary ---
    if (!isValid) {
        console.log("Validation errors found:", errors);        showValidationErrors([...new Set(errors)]); // Show unique generic field names
    } else {
        console.log("Form validation passed.");
    }
    return isValid;
  }

  // نمایش خطاهای اعتبارسنجی
  // این بخش بدون تغییر است
  function showValidationErrors(errorMessages) {
     if (!errorsList || !validationErrorsContainer) return;
    errorsList.innerHTML = '';
     if (errorMessages.length === 0) {
         validationErrorsContainer.classList.add('hidden');
         return;
     }
    errorMessages.forEach(error => { const li = document.createElement('li'); li.textContent = error; errorsList.appendChild(li); });
    validationErrorsContainer.classList.remove('hidden');
  }

  // اعتبارسنجی یک فیلد خاص
  // این بخش بدون تغییر است
  function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) { return true; } // Field doesn't exist, consider valid

    const parentSection = field.closest('.form-section');
    if (!parentSection || parentSection.classList.contains('hidden')) {
        hideFieldError(fieldId); // Ensure error is hidden if section is hidden
        return true; // Not visible, skip validation
    }

    let isValid = true;
    // Check for required text/number/tel/textarea fields
    if (field.required && field.value.trim() === '') {
      isValid = false;
      showFieldError(fieldId, errorMessage);
    }
    // Add specific format checks if needed (e.g., for buildYear)
    else if (fieldId.includes('buildYear') && field.value.trim() !== '') {
        const year = toEnglishDigits(field.value.trim());
        if (!/^(13[0-9]{2}|14[0-9]{2})$/.test(year)) { // Simple check for valid Persian year range
             isValid = false;
             showFieldError(fieldId, "سال ساخت نامعتبر است (مثال: ۱۴۰۲)");
        } else {
             hideFieldError(fieldId);
        }
    }
    else {
       hideFieldError(fieldId); // Clear error if valid or not required and empty
    }
    return isValid;
  }

  // اعتبارسنجی شماره تلفن
  // این بخش بدون تغییر است
  function validatePhone(fieldId) {
    const field = document.getElementById(fieldId);
     if (!field) return true;
    const value = toEnglishDigits(field.value.trim());
    let isValid = true;

     if (value !== '') {
        if (!/^09\d{9}$/.test(value)) {
          isValid = false;
          showFieldError(fieldId, 'فرمت صحیح: 09xxxxxxxxx'); // Shorter message
        } else {
            hideFieldError(fieldId);
        }
    } else if (field.required) {
        // Required and empty case is handled by validateField, but double-check
        isValid = false;
        showFieldError(fieldId, 'شماره تماس را وارد کنید');
    } else {
         hideFieldError(fieldId); // Not required and empty
     }
    return isValid;
  }

  // اعتبارسنجی بخش‌های مختلف ملک
  // **** این بخش تغییر کرده (اعتبارسنجی propertyStatus با checkbox) ****
  function validatePropertyType(propertyTypeKey) {
    let isValid = true;
    const sectionId = propertyTypeKey.startsWith('presale')
        ? `${propertyTypeKey.replace('-', '')}Details` // e.g., presaleApartmentDetails
        : `${propertyTypeKey}Details`; // e.g., apartmentDetails
    const sectionElement = document.getElementById(sectionId);

    if (!sectionElement || sectionElement.classList.contains('hidden')) {
        console.warn(`Validation skipped: Section "${sectionId}" not found or hidden.`);
        return true;
    }
    console.log(`Validating fields within section: ${sectionId}`);

    // 1. Validate Required Text/Number Fields within the section
    const requiredFields = getRequiredFieldsForPropertyType(propertyTypeKey);
    requiredFields.forEach(fieldId => {        const fieldElement = document.getElementById(fieldId); // Get element by full ID
        if (fieldElement && sectionElement.contains(fieldElement)) {
            const label = document.querySelector(`label[for="${fieldId}"]`);
            const fieldName = label ? label.textContent.replace('*', '').trim() : fieldId;
            if (!validateField(fieldId, `${fieldName} الزامی است`)) {
                isValid = false;
                console.log(`Validation failed for required field: ${fieldId}`);
            }
        } else {
             // console.warn(`Required field ${fieldId} not found within section ${sectionId}`);
        }
    });

    // 2. *** Property Status Checkbox Validation (حداقل یکی الزامی) ***
    const propertyStatusSelector = `input[name="propertyStatus"]:checked`; // Name is consistent
    const propertyStatusChecked = sectionElement.querySelectorAll(propertyStatusSelector); // Select ALL checked checkboxes within section
    const propertyStatusErrorId = `propertyStatus-${propertyTypeKey}Error`; // e.g., propertyStatus-apartmentError
    const propertyStatusGroupContainer = document.getElementById(`propertyStatusGroup-${propertyTypeKey}`); // Get the group container by ID

    if (propertyStatusGroupContainer) { // Check if the group container exists
        if (propertyStatusChecked.length === 0) { // Check if NO checkbox is checked
            isValid = false;
            showFieldError(propertyStatusErrorId, 'حداقل یک وضعیت ملک را انتخاب کنید');
            propertyStatusGroupContainer.classList.add('error-field'); // Highlight group container
             console.log(`Validation failed for propertyStatus in ${propertyTypeKey}`);
        } else {
            hideFieldError(propertyStatusErrorId);
            propertyStatusGroupContainer.classList.remove('error-field'); // Remove highlight from group
        }
    } else {
        console.warn(`Property Status Group container not found for key: ${propertyTypeKey} (ID: propertyStatusGroup-${propertyTypeKey})`);
    }

    // 3. *** Sale Conditions Checkbox Validation (حداقل یکی الزامی) ***
    const saleConditionsSelector = `input[name="saleConditions"]:checked`; // Name is consistent
    const saleConditionsChecked = sectionElement.querySelectorAll(saleConditionsSelector); // Select ALL checked checkboxes within section
    const saleConditionsErrorId = `saleConditions-${propertyTypeKey}Error`; // e.g., saleConditions-apartmentError
    const saleConditionsGroupContainer = document.getElementById(`saleConditionsGroup-${propertyTypeKey}`); // Get the group container by ID

    if (saleConditionsGroupContainer) { // Check if the group container exists
        if (saleConditionsChecked.length === 0) { // Check if NO checkbox is checked
            isValid = false;
            showFieldError(saleConditionsErrorId, 'حداقل یک شرط فروش را انتخاب کنید');
            saleConditionsGroupContainer.classList.add('error-field'); // Highlight group container
            console.log(`Validation failed for saleConditions in ${propertyTypeKey}`);
        } else {
            hideFieldError(saleConditionsErrorId);
            saleConditionsGroupContainer.classList.remove('error-field'); // Remove highlight from group
        }
    } else {
        console.warn(`Sale Conditions Group container not found for key: ${propertyTypeKey} (ID: saleConditionsGroup-${propertyTypeKey})`);
    }


    // 4. Add validation for other required radio/checkbox groups if needed
     if (propertyTypeKey === 'land') {
        // Example: Validate 'enclosed' radio if it exists and is required
        // const enclosedChecked = sectionElement.querySelector(`input[name="enclosed"]:checked`);
        // const enclosedErrorId = `enclosed-${propertyTypeKey}Error`; // Assuming an error div exists
        // const enclosedGroup = document.getElementById(`enclosedGroup-${propertyTypeKey}`); // Assuming a group div exists
        // if (enclosedGroup && !enclosedChecked) { // Add required check if necessary
        //     isValid = false;
        //     showFieldError(enclosedErrorId, 'لطفاً وضعیت محصور بودن را انتخاب کنید');
        //     enclosedGroup.classList.add('error-field');
        // } else if(enclosedGroup) {
        //     hideFieldError(enclosedErrorId);
        //     enclosedGroup.classList.remove('error-field');
        // }
     }
    // Add similar checks for 'commercial', 'old', etc. if they have required radio/checkboxes

    return isValid;
  }

  // دریافت فیلدهای الزامی برای هر نوع ملک
  // این بخش بدون تغییر است (فقط از ID های دقیق مطمئن شوید)
  function getRequiredFieldsForPropertyType(propertyTypeKey) {
    // Ensure these IDs match exactly with your HTML input/textarea IDs *within* the specific sections
    const fields = {
      'apartment': [
          'unitArea-apartment', 'roomCount-apartment', 'unitsPerFloor-apartment', 'totalUnits-apartment',          'floorCount-apartment', 'floorNumber-apartment', 'buildYear-apartment', 'totalPrice-apartment',
          'address-apartment' // Textarea name needs to be correct
        ],
      'villa': [
          'landArea-villa', 'buildingArea-villa', 'roomCount-villa',
          'buildYear-villa', 'price-villa', // Check if price is total price ID for villa
          'address-villa' // Textarea name needs to be correct
        ],
      'land': [
          'landArea-land', 'landUsage', 'totalPrice-land',
          'address-land' // Textarea name needs to be correct
        ],
      'commercial': [
          'shopArea', 'totalPrice-commercial',
          'address-commercial' // Textarea name needs to be correct
        ],
      'old': [          'landArea-old', 'totalPrice-old',
          'address-old' // Textarea name needs to be correct
        ],
      'presale-apartment': [ // Required fields for PRE-SALE Apartment section
          'unitArea-presale-apartment', 'roomCount-presale-apartment',
          'totalPrice-presale-apartment',
          'address-presale-apartment' // Textarea name needs to be correct
        ],
      'presale-villa': [ // Required fields for PRE-SALE Villa section
          'landArea-presale-villa', 'buildingArea-presale-villa',
          'roomCount-presale-villa', 'floorCount-presale-villa',
          'price-presale-villa', // Check price ID
          'address-presale-villa' // Textarea name needs to be correct
        ]
    };
    // Add the common projectProgress field if it's a presale type
    if (propertyTypeKey.startsWith('presale-')) {
        return ['projectProgress', ...(fields[propertyTypeKey] || [])];
    }
    return fields[propertyTypeKey] || [];
  }

  // نمایش خطای فیلد
  // این بخش بدون تغییر است
  function showFieldError(fieldOrErrorId, message) {
      let fieldId = fieldOrErrorId.endsWith('Error') ? fieldOrErrorId.replace('Error', '') : fieldOrErrorId;      let errorElementId = fieldId.endsWith('Error') ? fieldId : fieldId + 'Error';

      const field = document.getElementById(fieldId);
      const errorElement = document.getElementById(errorElementId);

      field?.classList.add('error-field');
      // If it's likely a group error (radio/checkbox), try highlighting the container
      if (!field && errorElement) {
         const groupContainer = errorElement.closest('.form-check-group, .mt-4'); // Find a reasonable container
         groupContainer?.classList.add('error-field');      }

      if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.remove('hidden');
      } else {
         // console.warn(`Error element with ID "${errorElementId}" not found.`);
      }
  }

  // پنهان کردن خطای فیلد
  // این بخش بدون تغییر است
  function hideFieldError(fieldOrErrorId) {
      let fieldId = fieldOrErrorId.endsWith('Error') ? fieldOrErrorId.replace('Error', '') : fieldOrErrorId;
      let errorElementId = fieldId.endsWith('Error') ? fieldId : fieldId + 'Error';

      const field = document.getElementById(fieldId);
      const errorElement = document.getElementById(errorElementId);

      field?.classList.remove('error-field');
       if (!field && errorElement) {
         const groupContainer = errorElement.closest('.form-check-group, .mt-4');
         groupContainer?.classList.remove('error-field');
      }

      if (errorElement) {
          errorElement.classList.add('hidden');
          errorElement.textContent = '';
      }
  }

  // دریافت کلید نوع ملک
  // این بخش بدون تغییر است
  function getSelectedPropertyTypeKey() {
    const selectedTypeInput = document.querySelector('input[name="propertyType"]:checked');
    if (!selectedTypeInput) return null;
    const selectedType = selectedTypeInput.value;

    if (selectedType === 'پیش‌فروش') {
      const selectedPresaleTypeInput = document.querySelector('input[name="presaleType"]:checked');
      if (!selectedPresaleTypeInput) return 'presale-base';
      const selectedPresaleType = selectedPresaleTypeInput.value;
      return `presale-${selectedPresaleType === 'آپارتمان' ? 'apartment' : 'villa'}`;
    }

    const typeMap = { 'آپارتمان': 'apartment', 'ویلا': 'villa', 'زمین': 'land', 'تجاری / مغازه': 'commercial', 'کلنگی': 'old' };
    return typeMap[selectedType] || null;
  }


  // --- توابع جمع‌آوری اطلاعات ---
  // **** این بخش تغییر کرده (جمع‌آوری propertyStatus با checkbox) ****
  function collectFormData() {
    const selectedTypeValue = document.querySelector('input[name="propertyType"]:checked')?.value;
    const propertyTypeKey = getSelectedPropertyTypeKey(); // 'apartment', 'villa', 'presale-apartment', etc. or 'presale-base' or null
    console.log(`Collecting form data for type key: ${propertyTypeKey || 'None selected'}`);

    const data = {
      uniqueId,
      registrationDate: registrationDateField?.value || 'نامشخص',
      propertyType: selectedTypeValue || 'نامشخص', // User-facing type name
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      phone: toEnglishDigits(document.getElementById('phone')?.value.trim() || ''),
      altPhone: toEnglishDigits(document.getElementById('altPhone')?.value.trim() || 'وارد نشده')
    };

    // Only collect details if a specific type (or specific presale type) is selected and visible
    if (propertyTypeKey && propertyTypeKey !== 'presale-base') {
        const sectionId = propertyTypeKey.startsWith('presale')
            ? `${propertyTypeKey.replace('-', '')}Details`
            : `${propertyTypeKey}Details`;
        const sectionElement = document.getElementById(sectionId);

        if (sectionElement && !sectionElement.classList.contains('hidden')) {
            console.log(`Collecting details from section: #${sectionId}`);
            // *** Collect propertyStatus using getCheckedValuesInSection ***
            data.propertyStatus = getCheckedValuesInSection('propertyStatus', sectionElement, 'وارد نشده');
            // *** Collect saleConditions using getCheckedValuesInSection ***
            data.saleConditions = getCheckedValuesInSection('saleConditions', sectionElement, 'هیچکدام');

            // Collect common fields (ensure input/textarea names match this pattern or adjust)
             const detailsInputId = `saleConditionDetails-${propertyTypeKey}`;
             data.saleConditionDetails = sectionElement.querySelector(`#${detailsInputId}`)?.value.trim() || 'ندارد';
             const addressTextareaId = `address-${propertyTypeKey}`; // Make sure textarea has this ID
             data.address = sectionElement.querySelector(`#${addressTextareaId}`)?.value.trim() || 'وارد نشده';


            // Define specific collectors for each type
            const collectionFunctions = {
                'apartment': collectApartmentData, 'villa': collectVillaData, 'land': collectLandData,
                'commercial': collectCommercialData, 'old': collectOldData,
                'presale-apartment': collectPresaleApartmentData, 'presale-villa': collectPresaleVillaData
            };

            // Collect common presale fields if applicable (progress is outside the specific sections)
            if (propertyTypeKey.startsWith('presale')) {
                data.presaleType = propertyTypeKey.includes('apartment') ? 'آپارتمان' : 'ویلا';
                data.projectProgress = document.getElementById('projectProgress')?.value.trim() || 'وارد نشده';
            }

            // Call the specific collection function, passing the section element for context
            if (collectionFunctions[propertyTypeKey]) {
                console.log(`Calling collection function for ${propertyTypeKey}`);
                Object.assign(data, collectionFunctions[propertyTypeKey](propertyTypeKey, sectionElement));
            } else {
                console.warn(`No collection function defined for key: ${propertyTypeKey}`);
            }
        } else {
             console.warn(`Data collection skipped: Section "#${sectionId}" not found or hidden.`);
        }

    } else if (propertyTypeKey === 'presale-base') {
        // Collect only progress if only base presale is selected and its section is visible
        const presaleBaseSection = document.getElementById('presaleTypeSection');
        if (presaleBaseSection && !presaleBaseSection.classList.contains('hidden')) {
             data.projectProgress = document.getElementById('projectProgress')?.value.trim() || 'وارد نشده';             console.log("Collected project progress from presale base section.");
        }
    }
    console.log("Finished collecting form data:", data);
    return data;
  }

  // --- توابع کمکی جمع‌آوری داده (بدون تغییر) ---
  // این بخش بدون تغییر است
  function getFieldValueInSection(fieldId, sectionElement) { const element = sectionElement.querySelector(`#${fieldId}`); return element ? element.value.trim() : ''; }
  function getOptionalFieldValueInSection(fieldId, sectionElement, defaultValue = 'وارد نشده') { const value = getFieldValueInSection(fieldId, sectionElement); return value === '' ? defaultValue : value; }
  function getCheckedValuesInSection(name, sectionElement, noneValue = 'هیچکدام') { const selector = `input[name="${name}"]:checked`; const checkboxes = sectionElement.querySelectorAll(selector); if (checkboxes.length === 0) return noneValue; return Array.from(checkboxes).map(cb => cb.value).join('، '); } // Joins with Persian comma
  function getSelectedRadioValueInSection(name, sectionElement, defaultValue = '') { const selector = `input[name="${name}"]:checked`; const radio = sectionElement.querySelector(selector); return radio ? radio.value : defaultValue; }

  // --- توابع جمع‌آوری داده برای هر نوع ملک (بدون تغییر ساختاری، فقط از ID های صحیح مطمئن شوید) ---
  // این بخش بدون تغییر است (فقط ID ها باید با HTML مطابقت داشته باشند)
  function collectApartmentData(key, section) { return { landArea: getOptionalFieldValueInSection(`landArea-${key}`, section), unitArea: getFieldValueInSection(`unitArea-${key}`, section), roomCount: getFieldValueInSection(`roomCount-${key}`, section), unitsPerFloor: getFieldValueInSection(`unitsPerFloor-${key}`, section), totalUnits: getFieldValueInSection(`totalUnits-${key}`, section), floorCount: getFieldValueInSection(`floorCount-${key}`, section), floorNumber: getFieldValueInSection(`floorNumber-${key}`, section), buildYear: getFieldValueInSection(`buildYear-${key}`, section), apartmentFeatures: getCheckedValuesInSection('apartmentFeature', section), buildingFacade: getSelectedRadioValueInSection('buildingFacade', section, 'وارد نشده'), commonAreas: getCheckedValuesInSection('commonAreas', section), hvacSystems: getCheckedValuesInSection('hvacSystems', section), floorCovering: getCheckedValuesInSection('floorCovering', section), kitchen: getCheckedValuesInSection('kitchen', section), bathroom: getCheckedValuesInSection('bathroom', section), ceilingWall: getCheckedValuesInSection('ceilingWall', section), otherAmenities: getCheckedValuesInSection('otherAmenities', section), occupancyStatus: getSelectedRadioValueInSection('occupancyStatus', section, 'وارد نشده'), parkingType: getCheckedValuesInSection('parkingType', section), parkingCount: getOptionalFieldValueInSection(`parkingCount-${key}`, section, '0'), utilities: getCheckedValuesInSection('utilities', section), visitTime: getOptionalFieldValueInSection(`visitTime-${key}`, section, 'ندارد'), otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), pricePerMeter: getOptionalFieldValueInSection(`pricePerMeter-${key}`, section), totalPrice: getFieldValueInSection(`totalPrice-${key}`, section), }; }
  function collectVillaData(key, section) { return { landArea: getFieldValueInSection(`landArea-${key}`, section), buildingArea: getFieldValueInSection(`buildingArea-${key}`, section), roomCount: getFieldValueInSection(`roomCount-${key}`, section), totalFloors: getOptionalFieldValueInSection(`totalFloors-${key}`, section), buildYear: getFieldValueInSection(`buildYear-${key}`, section), villaFeatures: getCheckedValuesInSection('villaFeature', section), buildingFacade: getSelectedRadioValueInSection('buildingFacade', section, 'وارد نشده'), commonAreas: getCheckedValuesInSection('commonAreas', section), hvacSystems: getCheckedValuesInSection('hvacSystems', section), floorCovering: getCheckedValuesInSection('floorCovering', section), kitchen: getCheckedValuesInSection('kitchen', section), bathroom: getCheckedValuesInSection('bathroom', section), ceilingWall: getCheckedValuesInSection('ceilingWall', section), otherAmenities: getCheckedValuesInSection('otherAmenities', section), occupancyStatus: getSelectedRadioValueInSection('occupancyStatus', section, 'وارد نشده'), utilities: getCheckedValuesInSection('utilities', section), visitTime: getOptionalFieldValueInSection(`visitTime-${key}`, section, 'ندارد'), otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), price: getFieldValueInSection(`price-${key}`, section), }; } // Uses price-villa
  function collectLandData(key, section) { return { landArea: getFieldValueInSection(`landArea-${key}`, section), landUsage: getFieldValueInSection('landUsage', section), /* Add other land fields */ otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), pricePerMeter: getOptionalFieldValueInSection(`pricePerMeter-${key}`, section), totalPrice: getFieldValueInSection(`totalPrice-${key}`, section), }; }
  function collectCommercialData(key, section) { return { shopArea: getFieldValueInSection('shopArea', section), /* Add other commercial fields */ otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), pricePerMeter: getOptionalFieldValueInSection(`pricePerMeter-${key}`, section), totalPrice: getFieldValueInSection(`totalPrice-${key}`, section), }; }
  function collectOldData(key, section) { return { landArea: getFieldValueInSection(`landArea-${key}`, section), buildingArea: getOptionalFieldValueInSection(`buildingArea-${key}`, section), /* Add other old fields */ otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), pricePerMeter: getOptionalFieldValueInSection(`pricePerMeter-${key}`, section), totalPrice: getFieldValueInSection(`totalPrice-${key}`, section), }; }
  function collectPresaleApartmentData(key, section) { return { landArea: getOptionalFieldValueInSection(`landArea-${key}`, section), unitArea: getFieldValueInSection(`unitArea-${key}`, section), roomCount: getFieldValueInSection(`roomCount-${key}`, section), /* Add other presale apartment fields */ otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), pricePerMeter: getOptionalFieldValueInSection(`pricePerMeter-${key}`, section), totalPrice: getFieldValueInSection(`totalPrice-${key}`, section), }; }
  function collectPresaleVillaData(key, section) { return { landArea: getFieldValueInSection(`landArea-${key}`, section), buildingArea: getFieldValueInSection(`buildingArea-${key}`, section), roomCount: getFieldValueInSection(`roomCount-${key}`, section), floorCount: getFieldValueInSection(`floorCount-${key}`, section), /* Add other presale villa fields */ otherDetails: getOptionalFieldValueInSection(`otherDetails-${key}`, section, 'ندارد'), price: getFieldValueInSection(`price-${key}`, section), }; } // Uses price-presale-villa


  // --- تابع ارسال ایمیل ---
  // **** این بخش تغییر کرده (قالب بندی HTML برای ایمیل) ****
  async function sendEmail(formData) {
    console.log("Preparing email parameters...");
    // Helper to format price with Persian digits and "تومان"
    const formatPrice = (priceString) => {
      if (!priceString || priceString === 'وارد نشده' || String(priceString).trim() === '') return 'وارد نشده';
      const numericValue = unformatNumber(priceString);
      return isNaN(numericValue) ? 'نامعتبر' : formatNumber(String(numericValue)) + " تومان";
    };
    // Helper to format metric values with Persian digits and optional unit
     const formatMetric = (value, unit = '') => {
         if (!value || value === 'وارد نشده' || String(value).trim() === '') return 'وارد نشده';
         const numericValue = toEnglishDigits(String(value).trim());
         const displayValue = /^\d+$/.test(numericValue) ? toPersianDigits(numericValue) : String(value).trim();
         return displayValue + (unit ? ` ${unit}` : '');
     };

    // Prepare template parameters for EmailJS
    const templateParams = {      to_name: "املاک معین",
      // *** عنوان ایمیل دینامیک ***
      subject: `ثبت ${formData.propertyType || 'ملک'} جدید - ${formData.firstName} ${formData.lastName}`,
      reply_to: "no-reply@yourdomain.com", // Optional
      unique_id: formData.uniqueId,
      registration_date: formData.registrationDate ? toPersianDigits(formData.registrationDate) : 'نامشخص',
      name: `${formData.firstName} ${formData.lastName}`,
      phone: toPersianDigits(formData.phone),
      altPhone: formData.altPhone !== 'وارد نشده' ? toPersianDigits(formData.altPhone) : 'وارد نشده',
      property_type: formData.propertyType,
      // *** property_status اکنون مقادیر چک‌باکس را دارد ***
      property_status: formData.propertyStatus || 'وارد نشده',
      address: formData.address || 'وارد نشده',
      saleConditions: formData.saleConditions || 'هیچکدام',
      saleConditionDetails: formData.saleConditionDetails || 'ندارد',

      // Prices (will be used based on the formatting function)
      price: formData.price, // Raw value for villa/presale-villa
      totalPrice: formData.totalPrice, // Raw value for others
      pricePerMeter: formData.pricePerMeter, // Raw value

      // Presale specific fields      presaleType: formData.presaleType || '',
      projectProgress: formData.projectProgress ? formatMetric(formData.projectProgress) : '',

      // Initialize detail strings (ensure these match your EmailJS template variables EXACTLY, e.g., {{apartmentDetails}} )
      apartmentDetails: '', villaDetails: '', landDetails: '',
      commercialDetails: '', oldDetails: '',
      presaleapartmentDetails: '', presalevillaDetails: '' // No hyphen in template variable
    };

    // Populate the correct detail string based on propertyTypeKey using HTML format
    const propertyTypeKey = getSelectedPropertyTypeKey();
    if (propertyTypeKey && propertyTypeKey !== 'presale-base') {
        const detailFormatters = {
            'apartment': formatApartmentDetailsForEmail, 'villa': formatVillaDetailsForEmail,
            'land': formatLandDetailsForEmail, 'commercial': formatCommercialDetailsForEmail,
            'old': formatOldDetailsForEmail, 'presale-apartment': formatPresaleApartmentDetailsForEmail,
            'presale-villa': formatPresaleVillaDetailsForEmail
        };

        if (detailFormatters[propertyTypeKey]) {
            const detailParamKey = propertyTypeKey.replace('-', '') + 'Details';
            if (templateParams.hasOwnProperty(detailParamKey)) {
                console.log(`Formatting details for ${detailParamKey}...`);
                // Pass helper functions to the formatter
                templateParams[detailParamKey] = detailFormatters[propertyTypeKey](formData, formatMetric, formatPrice);
            } else {
                console.warn(`Template parameter key "${detailParamKey}" not found.`);
                 templateParams[detailParamKey] = "<p>خطا: کلید قالب برای جزئیات یافت نشد.</p>";
            }
        } else {
             console.warn(`Detail formatter function not found for key: ${propertyTypeKey}`);
             // Provide a default message if formatter is missing
             const detailParamKey = propertyTypeKey.replace('-', '') + 'Details';
              if (templateParams.hasOwnProperty(detailParamKey)) {
                 templateParams[detailParamKey] = "<p>خطا: تابع قالب‌بندی جزئیات یافت نشد.</p>";
              }
        }
    }

    console.log("Final templateParams being sent to EmailJS:", templateParams);

    // ======================================================
    // ========== ارسال با شناسه‌های نهایی (بدون تغییر) ==========
    // این بخش بدون تغییر است
    return emailjs.send(
        "service_rds9l25",      // <<-- Service ID شما
        "template_5do0c0n",     // <<-- Template ID شما
        templateParams
    );
    // ======================================================
  }

    // --- توابع قالب‌بندی جزئیات برای ایمیل (با خروجی HTML) ---
    // **** این بخش تغییر کرده (خروجی HTML) ****
    function formatApartmentDetailsForEmail(data, formatMetric, formatPrice) {
        let details = `<h3>جزئیات آپارتمان:</h3><ul>`;
        if (data.landArea && data.landArea !== 'وارد نشده') details += `<li><strong>متراژ زمین:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
        details += `<li><strong>متراژ واحد:</strong> ${formatMetric(data.unitArea, 'متر')}</li>`;
        details += `<li><strong>تعداد اتاق‌ها:</strong> ${formatMetric(data.roomCount)}</li>`;
        details += `<li><strong>واحد در طبقه:</strong> ${formatMetric(data.unitsPerFloor)}</li>`;
        details += `<li><strong>تعداد کل واحدها:</strong> ${formatMetric(data.totalUnits)}</li>`;
        details += `<li><strong>تعداد کل طبقات:</strong> ${formatMetric(data.floorCount)}</li>`;
        details += `<li><strong>طبقه واحد:</strong> ${formatMetric(data.floorNumber)}</li>`;
        details += `<li><strong>سال ساخت:</strong> ${formatMetric(data.buildYear)}</li>`;
        if (data.occupancyStatus && data.occupancyStatus !== 'وارد نشده') details += `<li><strong>وضعیت سکونت:</strong> ${data.occupancyStatus}</li>`;
        if (data.apartmentFeatures && data.apartmentFeatures !== 'هیچکدام') details += `<li><strong>مشخصه ملک:</strong> ${data.apartmentFeatures}</li>`;
        if (data.buildingFacade && data.buildingFacade !== 'وارد نشده') details += `<li><strong>نمای ساختمان:</strong> ${data.buildingFacade}</li>`;
        if (data.commonAreas && data.commonAreas !== 'هیچکدام') details += `<li><strong>مشاعات:</strong> ${data.commonAreas}</li>`;
        if (data.hvacSystems && data.hvacSystems !== 'هیچکدام') details += `<li><strong>تاسیسات سرمایشی/گرمایشی:</strong> ${data.hvacSystems}</li>`;
        if (data.floorCovering && data.floorCovering !== 'هیچکدام') details += `<li><strong>پوشش کف:</strong> ${data.floorCovering}</li>`;
        if (data.kitchen && data.kitchen !== 'هیچکدام') details += `<li><strong>آشپزخانه:</strong> ${data.kitchen}</li>`;
        if (data.bathroom && data.bathroom !== 'هیچکدام') details += `<li><strong>سرویس بهداشتی/حمام:</strong> ${data.bathroom}</li>`;
        if (data.ceilingWall && data.ceilingWall !== 'هیچکدام') details += `<li><strong>پوشش سقف/دیوار:</strong> ${data.ceilingWall}</li>`;
        if (data.otherAmenities && data.otherAmenities !== 'هیچکدام') details += `<li><strong>سایر امکانات:</strong> ${data.otherAmenities}</li>`;
        if (data.parkingType && data.parkingType !== 'هیچکدام') details += `<li><strong>نوع پارکینگ:</strong> ${data.parkingType}</li>`;
        details += `<li><strong>تعداد پارکینگ:</strong> ${formatMetric(data.parkingCount)}</li>`;
        if (data.utilities && data.utilities !== 'هیچکدام') details += `<li><strong>امتیازات:</strong> ${data.utilities}</li>`;
        details += `</ul>`;
        if (data.visitTime && data.visitTime !== 'ندارد') details += `<p><strong>شرایط بازدید:</strong> ${data.visitTime}</p>`;
        if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
        details += `<hr><p><strong>قیمت متری:</strong> ${formatPrice(data.pricePerMeter)}</p>`;
        details += `<p><strong>قیمت کلی:</strong> ${formatPrice(data.totalPrice)}</p>`;
        return details;
    }
    function formatVillaDetailsForEmail(data, formatMetric, formatPrice) {
        let details = `<h3>جزئیات ویلا:</h3><ul>`;
        details += `<li><strong>متراژ زمین:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
        details += `<li><strong>متراژ بنا:</strong> ${formatMetric(data.buildingArea, 'متر')}</li>`;
        details += `<li><strong>تعداد اتاق:</strong> ${formatMetric(data.roomCount)}</li>`;
        if (data.totalFloors && data.totalFloors !== 'وارد نشده') details += `<li><strong>کل طبقات:</strong> ${formatMetric(data.totalFloors)}</li>`;
        details += `<li><strong>سال ساخت:</strong> ${formatMetric(data.buildYear)}</li>`;
        if (data.occupancyStatus && data.occupancyStatus !== 'وارد نشده') details += `<li><strong>وضعیت سکونت:</strong> ${data.occupancyStatus}</li>`;
        if (data.villaFeatures && data.villaFeatures !== 'هیچکدام') details += `<li><strong>مشخصه ملک:</strong> ${data.villaFeatures}</li>`;
        if (data.buildingFacade && data.buildingFacade !== 'وارد نشده') details += `<li><strong>نمای ساختمان:</strong> ${data.buildingFacade}</li>`;
        if (data.commonAreas && data.commonAreas !== 'هیچکدام') details += `<li><strong>مشاعات:</strong> ${data.commonAreas}</li>`;
        if (data.hvacSystems && data.hvacSystems !== 'هیچکدام') details += `<li><strong>تاسیسات:</strong> ${data.hvacSystems}</li>`;
        if (data.floorCovering && data.floorCovering !== 'هیچکدام') details += `<li><strong>پوشش کف:</strong> ${data.floorCovering}</li>`;
        if (data.kitchen && data.kitchen !== 'هیچکدام') details += `<li><strong>آشپزخانه:</strong> ${data.kitchen}</li>`;
        if (data.bathroom && data.bathroom !== 'هیچکدام') details += `<li><strong>سرویس بهداشتی:</strong> ${data.bathroom}</li>`;
        if (data.ceilingWall && data.ceilingWall !== 'هیچکدام') details += `<li><strong>سقف/دیوار:</strong> ${data.ceilingWall}</li>`;
        if (data.otherAmenities && data.otherAmenities !== 'هیچکدام') details += `<li><strong>سایر امکانات:</strong> ${data.otherAmenities}</li>`;
        if (data.utilities && data.utilities !== 'هیچکدام') details += `<li><strong>امتیازات:</strong> ${data.utilities}</li>`;
        details += `</ul>`;
        if (data.visitTime && data.visitTime !== 'ندارد') details += `<p><strong>شرایط بازدید:</strong> ${data.visitTime}</p>`;
        if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
        details += `<hr><p><strong>قیمت کل:</strong> ${formatPrice(data.price)}</p>`; // Villa uses 'price'
        return details;
    }
    function formatLandDetailsForEmail(data, formatMetric, formatPrice) {
         let details = `<h3>جزئیات زمین:</h3><ul>`;
         details += `<li><strong>متراژ زمین:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
         details += `<li><strong>کاربری:</strong> ${data.landUsage || 'وارد نشده'}</li>`;
         // Add other land fields collected...
         details += `</ul>`;
         if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
         details += `<hr><p><strong>قیمت متری:</strong> ${formatPrice(data.pricePerMeter)}</p>`;
         details += `<p><strong>قیمت کلی:</strong> ${formatPrice(data.totalPrice)}</p>`;
         return details;    }
    function formatCommercialDetailsForEmail(data, formatMetric, formatPrice) {
         let details = `<h3>جزئیات تجاری/مغازه:</h3><ul>`;
         details += `<li><strong>متراژ:</strong> ${formatMetric(data.shopArea, 'متر')}</li>`;
         // Add other commercial fields collected...
         details += `</ul>`;
         if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
         details += `<hr><p><strong>قیمت متری:</strong> ${formatPrice(data.pricePerMeter)}</p>`;
         details += `<p><strong>قیمت کلی:</strong> ${formatPrice(data.totalPrice)}</p>`;
         return details;
    }
    function formatOldDetailsForEmail(data, formatMetric, formatPrice) {
         let details = `<h3>جزئیات ملک کلنگی:</h3><ul>`;
         details += `<li><strong>متراژ زمین:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
         if (data.buildingArea && data.buildingArea !== 'وارد نشده') details += `<li><strong>متراژ بنای موجود:</strong> ${formatMetric(data.buildingArea, 'متر')}</li>`;
         // Add other old fields collected...
         details += `</ul>`;
         if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
         details += `<hr><p><strong>قیمت متری زمین:</strong> ${formatPrice(data.pricePerMeter)}</p>`;
         details += `<p><strong>قیمت کلی:</strong> ${formatPrice(data.totalPrice)}</p>`;
         return details;
    }
    function formatPresaleApartmentDetailsForEmail(data, formatMetric, formatPrice) {
         let details = `<h3>جزئیات پیش‌فروش آپارتمان:</h3><ul>`;
         if (data.landArea && data.landArea !== 'وارد نشده') details += `<li><strong>متراژ زمین پروژه:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
         details += `<li><strong>متراژ واحد:</strong> ${formatMetric(data.unitArea, 'متر')}</li>`;
         details += `<li><strong>تعداد اتاق:</strong> ${formatMetric(data.roomCount)}</li>`;
         // Add other presale apartment fields collected...
         details += `</ul>`;
         if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
         details += `<hr><p><strong>قیمت متری:</strong> ${formatPrice(data.pricePerMeter)}</p>`;
         details += `<p><strong>قیمت کلی:</strong> ${formatPrice(data.totalPrice)}</p>`;
         return details;
    }
    function formatPresaleVillaDetailsForEmail(data, formatMetric, formatPrice) {
         let details = `<h3>جزئیات پیش‌فروش ویلا:</h3><ul>`;
         details += `<li><strong>متراژ زمین:</strong> ${formatMetric(data.landArea, 'متر')}</li>`;
         details += `<li><strong>متراژ بنا:</strong> ${formatMetric(data.buildingArea, 'متر')}</li>`;
         details += `<li><strong>تعداد اتاق‌ها:</strong> ${formatMetric(data.roomCount)}</li>`;
         details += `<li><strong>تعداد طبقات:</strong> ${formatMetric(data.floorCount)}</li>`;
         // Add other presale villa fields collected...
         details += `</ul>`;
         if (data.otherDetails && data.otherDetails !== 'ندارد') details += `<p><strong>توضیحات بیشتر:</strong> ${data.otherDetails}</p>`;
         details += `<hr><p><strong>قیمت کل:</strong> ${formatPrice(data.price)}</p>`; // Presale villa uses 'price'
         return details;
    }


  // --- توابع مدیریت Overlay ها و صدا و ... ---
  // این بخش بدون تغییر است
  function generateUniqueId() { return Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString(36).slice(-4); }
  function playSound(soundId) { const sound = document.getElementById(soundId); if (sound && sound.src) { sound.play().catch(e => console.warn(`Sound play failed for ${soundId}:`, e)); } else if (soundId !== 'dingSound') { /* console.warn(`Sound element or source not found for ID: ${soundId}`); */ } }
  function showSendingOverlayWithProgress() { if (!sendingOverlay) return; if(progressBar) { progressBar.style.width = '0%'; progressBar.textContent = '۰٪'; progressBar.setAttribute('aria-valuenow', 0); } showOverlay('sendingOverlay'); }
  function showSuccessOverlay() { showOverlay('successOverlay'); }
  function showErrorOverlay() { showOverlay('errorOverlay'); }
  function showConfirmOverlay() { console.log("Showing confirm overlay"); showOverlay('confirmOverlay'); }  function hideConfirmOverlay() { console.log("Hiding confirm overlay"); hideOverlay('confirmOverlay'); }
  function hideSuccessOverlay() { hideOverlay('successOverlay'); resetForm(); } // Reset form after closing success
  function hideErrorOverlay() { hideOverlay('errorOverlay'); }
  function showMenuOverlay() { showOverlay('menuOverlay'); }
  function hideMenuOverlay() { hideOverlay('menuOverlay'); }
  function showOverlay(id) { const overlay = document.getElementById(id); if (overlay) overlay.style.display = 'flex'; else console.error(`Overlay element #${id} not found.`); }
  function hideOverlay(id) { const overlay = document.getElementById(id); if (overlay) overlay.style.display = 'none'; }

  // پاک کردن فرم
  // این بخش بدون تغییر است
  function resetForm() {
    console.log("Resetting form...");
    if (!propertyForm) return;
    propertyForm.reset();
    Object.values(detailSections).forEach(section => section?.classList.add('hidden'));
    Object.values(presaleDetailSections).forEach(section => section?.classList.add('hidden'));
    clearAllErrors();
    uniqueId = generateUniqueId();
    setJalaliDate();
    hideConfirmOverlay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log("Form reset complete.");
  }
}); // End of DOMContentLoaded