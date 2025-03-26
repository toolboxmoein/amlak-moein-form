// تنظیمات Firebase (مطمئن شوید این مقادیر صحیح هستند)
const firebaseConfig = {
  apiKey: "AIzaSyBIcS9FeIQF0g0Hm_oYQgcGQHQy_HZKwjk", // از کد admin-panel.js شما گرفته شده
  authDomain: "amlak-form-app.firebaseapp.com",
  databaseURL: "https://amlak-form-app-default-rtdb.firebaseio.com",
  projectId: "amlak-form-app",
  storageBucket: "amlak-form-app.appspot.com",
  messagingSenderId: "657326173887",  appId: "1:657326173887:web:d7c3a9b3e4d4c7c1b0a5a0"
};

// مقداردهی اولیه Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// --- متغیرهای سراسری ---
let uploadedFiles = []; // آرایه‌ای برای نگهداری File object ها

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded and parsed"); // Debug log

  // --- انتخاب عناصر DOM ---
  const propertyTypeRadios = document.querySelectorAll('input[name="propertyType"]');
  const presaleTypeRadios = document.querySelectorAll('input[name="presaleType"]');
  const formSections = {
    apartment: document.getElementById('apartmentDetails'),    villa: document.getElementById('villaDetails'),
    land: document.getElementById('landDetails'),
    commercial: document.getElementById('commercialDetails'),
    old: document.getElementById('oldDetails'),
    presaleType: document.getElementById('presaleTypeSection'),
    presaleApartment: document.getElementById('presaleApartmentDetails'),
    presaleVilla: document.getElementById('presaleVillaDetails'),
    imageUpload: document.getElementById('imageUploadSection')
  };
  const typeErrorDiv = document.getElementById('typeError');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  const resetBtn = document.getElementById('resetBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYesBtn = document.getElementById('confirmYesBtn');
  const confirmNoBtn = document.getElementById('confirmNoBtn');
  const successOverlay = document.getElementById('successOverlay');
  const errorOverlay = document.getElementById('errorOverlay');
  const sendingOverlay = document.getElementById('sendingOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const closeErrorBtn = document.getElementById('closeErrorBtn');
  const imageUploadInput = document.getElementById('imageUpload');
  const imagePreviewContainer = document.getElementById('imagePreview');
  const uploadProgressContainer = document.getElementById('uploadProgressContainer');
  const propertyForm = document.getElementById('propertyForm');
  const validationErrorsDiv = document.getElementById('validationErrors');
  const errorsListUl = document.getElementById('errorsList');
  const dingSound = document.getElementById('dingSound');
  // const successSound = document.getElementById('successSound'); // successSound is not used

  // --- توابع ---

  // پنهان کردن همه بخش‌های جزئیات ملک
  function hideAllSections() {
    console.log("Hiding all sections..."); // Debug log
    for (const key in formSections) {
      if (formSections[key]) { // Check if element exists
        formSections[key].classList.add('hidden');
      } else {
          console.warn(`Section element not found: ${key}`);
      }
    }
    // همچنین بخش‌های داخلی پیش‌فروش را پنهان کن
    if (formSections.presaleApartment) formSections.presaleApartment.classList.add('hidden');
    if (formSections.presaleVilla) formSections.presaleVilla.classList.add('hidden');
    // پنهان کردن خطاهای احتمالی در بخش‌های مخفی
     document.querySelectorAll('.form-section.hidden .error').forEach(err => err.classList.add('hidden'));
     document.querySelectorAll('.form-section.hidden .error-field').forEach(field => field.classList.remove('error-field'));  }

  // نمایش بخش مربوط به نوع ملک
  function showPropertySection(type) {
    hideAllSections();
    typeErrorDiv.classList.add('hidden'); // Hide general type error
    if (formSections.imageUpload) formSections.imageUpload.classList.remove('hidden'); // Show image upload

    console.log("Showing section for type:", type); // Debug log

    switch(type) {
      case 'آپارتمان':
        if (formSections.apartment) formSections.apartment.classList.remove('hidden');
        break;
      case 'ویلا':        if (formSections.villa) formSections.villa.classList.remove('hidden');
        break;
      case 'زمین':
        if (formSections.land) formSections.land.classList.remove('hidden');
        break;
      case 'تجاری':
        if (formSections.commercial) formSections.commercial.classList.remove('hidden');
        break;
      case 'کلنگی':
        if (formSections.old) formSections.old.classList.remove('hidden');
        break;
      case 'پیش‌فروش':
        if (formSections.presaleType) formSections.presaleType.classList.remove('hidden');
        // Don't show apartment/villa details yet
        break;
      default:
          console.warn("Unknown property type selected:", type);
    }
  }

  // نمایش بخش مربوط به نوع پیش‌فروش
  function showPresaleSubType(subType) {
      if (formSections.presaleApartment) formSections.presaleApartment.classList.add('hidden');
      if (formSections.presaleVilla) formSections.presaleVilla.classList.add('hidden');

      console.log("Showing presale sub-type:", subType); // Debug log

      switch(subType) {
          case 'آپارتمان':
              if (formSections.presaleApartment) formSections.presaleApartment.classList.remove('hidden');
              break;
          case 'ویلا':
              if (formSections.presaleVilla) formSections.presaleVilla.classList.remove('hidden');
              break;
          default:
              console.warn("Unknown presale sub-type selected:", subType);
      }
  }

  // ریست کردن فرم
  function resetForm() {
    propertyForm.reset();
    hideAllSections();
    imagePreviewContainer.innerHTML = '';
    uploadProgressContainer.innerHTML = '';
    uploadedFiles = [];
    document.querySelectorAll('.error').forEach(error => error.classList.add('hidden'));
    validationErrorsDiv.classList.add('hidden');
    document.querySelectorAll('.error-field').forEach(field => field.classList.remove('error-field'));
    console.log("Form reset."); // Debug log
  }

  // --- مدیریت رویدادها ---

  // انتخاب نوع ملک
  propertyTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      console.log("Property type changed:", this.value); // Debug log
      showPropertySection(this.value);
      // Reset presale sub-type if main type changed away from presale
      if (this.value !== 'پیش‌فروش') {
         presaleTypeRadios.forEach(r => r.checked = false);
      }
    });
  });

  // انتخاب نوع پیش‌فروش
  presaleTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      console.log("Presale type changed:", this.value); // Debug log
      showPresaleSubType(this.value);
    });
  });

  // منوی همبرگری
  if (hamburgerMenu && menuOverlay && menuClose) {
      hamburgerMenu.addEventListener('click', () => menuOverlay.style.display = 'flex');
      menuClose.addEventListener('click', () => menuOverlay.style.display = 'none');
  }

  // دکمه پاک کردن و تأیید
  if (resetBtn && confirmOverlay && confirmYesBtn && confirmNoBtn) {
      resetBtn.addEventListener('click', () => confirmOverlay.style.display = 'flex');
      confirmYesBtn.addEventListener('click', () => {
          resetForm();
          confirmOverlay.style.display = 'none';
      });
      confirmNoBtn.addEventListener('click', () => confirmOverlay.style.display = 'none');
  }

  // بستن پیام‌های Overlay
  if (closeSuccessBtn && successOverlay) closeSuccessBtn.addEventListener('click', () => successOverlay.style.display = 'none');  if (closeErrorBtn && errorOverlay) closeErrorBtn.addEventListener('click', () => errorOverlay.style.display = 'none');

  // انتخاب عکس
 if (imageUploadInput && imagePreviewContainer) {
    imageUploadInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        console.log(`Files selected: ${files.length}`); // Debug log

        files.forEach(file => {
            if (file.type.match('image.*') && file.size <= 5 * 1024 * 1024) {
                const fileIndex = uploadedFiles.length; // Get index before pushing
                uploadedFiles.push(file); // Add file to array

                const reader = new FileReader();
                reader.onload = function(event) {
                    const previewItem = document.createElement('div');                    previewItem.classList.add('image-preview-item');
                    previewItem.dataset.fileIndex = fileIndex; // Store the original index

                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.alt = file.name;

                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.classList.add('remove-image-btn');
                    removeBtn.innerHTML = '&times;';
                    removeBtn.addEventListener('click', function() {
                        const itemToRemove = this.parentElement;
                        const indexToRemove = parseInt(itemToRemove.dataset.fileIndex);
                        console.log(`Removing image at index: ${indexToRemove}`); // Debug log

                        if (indexToRemove >= 0 && indexToRemove < uploadedFiles.length) {
                            // Mark file as null instead of splicing to preserve indices
                            uploadedFiles[indexToRemove] = null;
                            console.log("File marked as null:", uploadedFiles); // Debug log
                        }
                        itemToRemove.remove(); // Remove preview from DOM
                        // Optionally remove progress bar if exists
                        const progressId = `progress-${indexToRemove}`;
                        const progressDiv = document.getElementById(progressId);
                        if (progressDiv) progressDiv.remove();
                    });

                    previewItem.appendChild(img);
                    previewItem.appendChild(removeBtn);
                    imagePreviewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            } else {
                console.warn(`Invalid file skipped: ${file.name} (Type: ${file.type}, Size: ${file.size})`);
                alert(`فایل "${file.name}" معتبر نیست یا حجم آن بیش از 5 مگابایت است.`);
            }
        });
        e.target.value = null; // Clear input value
    });
}


  // --- اعتبارسنجی و ارسال فرم ---
  if (propertyForm) {
    propertyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log("Form submission initiated."); // Debug log

      if (!validateForm()) {
        console.log("Form validation failed."); // Debug log
        // Optionally scroll to first error
        const firstError = document.querySelector('.error-field, .error:not(.hidden)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      console.log("Form validation passed."); // Debug log
      sendingOverlay.style.display = 'flex';

      const formData = collectFormData();
      console.log("Collected Form Data:", formData); // Debug log

      // Filter out null files (removed ones)
      const filesToUpload = uploadedFiles.filter(file => file !== null);
      console.log(`Files to upload: ${filesToUpload.length}`); // Debug log

      uploadImagesToFirebase(filesToUpload)
        .then(imageUrls => {
          console.log("Image URLs received:", imageUrls); // Debug log
          formData.images = imageUrls || []; // Ensure images is always an array
          formData.dateTime = new Date().toISOString(); // Add submission timestamp

          console.log("Final data to save:", formData); // Debug log
          return saveDataToFirebase(formData);
        })
        .then(() => {
          console.log("Data saved successfully."); // Debug log
          sendingOverlay.style.display = 'none';
          if (dingSound) dingSound.play().catch(e => console.error("Error playing sound:", e)); // Play sound
          successOverlay.style.display = 'flex';
          resetForm(); // Reset form after success
        })        .catch(error => {
          console.error('Error during submission process:', error); // Log detailed error
          sendingOverlay.style.display = 'none';
          errorOverlay.style.display = 'flex';
        });
    });
  } else {
      console.error("Property form not found!");
  }

  // --- توابع کمکی اعتبارسنجی ---
  function validateRequired(inputId, errorId, listName) {
      const input = document.getElementById(inputId);
      const errorDiv = document.getElementById(errorId);
      if (!input || !errorDiv) { console.warn(`Missing element for ${inputId}`); return true; } // Skip if elements missing
      if (!input.value.trim()) {
          errorDiv.textContent = `لطفاً ${listName} را وارد کنید`;
          errorDiv.classList.remove('hidden');
          input.classList.add('error-field');
          return false;
      }
      errorDiv.classList.add('hidden');
      input.classList.remove('error-field');
      return true;
  }

  function validatePersian(inputId, errorId, listName, isRequired = true) {
      const input = document.getElementById(inputId);
      const errorDiv = document.getElementById(errorId);
      if (!input || !errorDiv) { console.warn(`Missing element for ${inputId}`); return true; }

      if (isRequired && !validateRequired(inputId, errorId, listName)) {
          return false; // Failed required check
      }

      if (input.value.trim() && !/^[\u0600-\u06FF\s.,،؛:؟!0-9۰-۹-]+$/.test(input.value.trim())) {
          errorDiv.textContent = 'لطفاً فقط از حروف فارسی، اعداد و علائم مجاز استفاده کنید';
          errorDiv.classList.remove('hidden');
          input.classList.add('error-field');
          return false;
      }
      // If not required or passes regex, hide error (redundant if validateRequired handled it)
      if (!isRequired || /^[\u0600-\u06FF\s.,،؛:؟!0-9۰-۹-]+$/.test(input.value.trim())) {
          errorDiv.classList.add('hidden');
          input.classList.remove('error-field');
      }
      return true;
  }

  function validateNumeric(inputId, errorId, listName, isRequired = true) {
      const input = document.getElementById(inputId);
      const errorDiv = document.getElementById(errorId);
       if (!input || !errorDiv) { console.warn(`Missing element for ${inputId}`); return true; }

      if (isRequired && !validateRequired(inputId, errorId, listName)) {
          return false; // Failed required check
      }

      // Allow empty if not required
      if (!isRequired && !input.value.trim()) {
           errorDiv.classList.add('hidden');
           input.classList.remove('error-field');
           return true;
      }

      // Check for non-digits (allow comma for display, but validation logic ignores it)
      if (/\D/.test(input.value.replace(/,/g, '').replace(/٬/g, ''))) {
          errorDiv.textContent = "لطفاً فقط عدد وارد کنید.";
          errorDiv.classList.remove('hidden');
          input.classList.add('error-field');
          return false;
      }
      errorDiv.classList.add('hidden');
      input.classList.remove('error-field');
      return true;
  }

   function validatePhone(inputId, errorId, listName) {
        const input = document.getElementById(inputId);
        const errorDiv = document.getElementById(errorId);
        if (!input || !errorDiv) { console.warn(`Missing element for ${inputId}`); return true; }

        if (!validateRequired(inputId, errorId, listName)) return false;

        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(input.value.trim())) {
            errorDiv.textContent = 'شماره موبایل 11 رقمی معتبر وارد کنید (مثال: 09123456789)';
            errorDiv.classList.remove('hidden');
            input.classList.add('error-field');
            return false;
        }
        errorDiv.classList.add('hidden');
        input.classList.remove('error-field');
        return true;
   }

  function validateRadioGroup(groupName, errorId, listName, sectionId) {
      const section = document.getElementById(sectionId);
      if (!section || section.classList.contains('hidden')) return true; // Skip validation if section is hidden

      const errorDiv = document.getElementById(errorId);
      if (!errorDiv) { console.warn(`Missing error element for ${errorId}`); return true; }

      // Find radio buttons *within the specific section*
      const checkedRadio = section.querySelector(`input[name="${groupName}"]:checked`);

      if (!checkedRadio) {
          errorDiv.textContent = `لطفاً ${listName} را انتخاب کنید`;
          errorDiv.classList.remove('hidden');
          // Optionally add error class to the group container if available
          return false;
      }
      errorDiv.classList.add('hidden');
      return true;
  }  function validateCheckboxGroup(groupName, errorId, listName, sectionId) {
      const section = document.getElementById(sectionId);
      if (!section || section.classList.contains('hidden')) return true; // Skip validation if section is hidden

      const errorDiv = document.getElementById(errorId);
       if (!errorDiv) { console.warn(`Missing error element for ${errorId}`); return true; }

      // Find checkboxes *within the specific section*
      const checkedBoxes = section.querySelectorAll(`input[name="${groupName}"]:checked`);

      if (checkedBoxes.length === 0) {
          errorDiv.textContent = `لطفاً حداقل یک ${listName} انتخاب کنید`;
          errorDiv.classList.remove('hidden');
          // Optionally add error class to the group container
          return false;
      }
      errorDiv.classList.add('hidden');
      return true;
  }


  // --- تابع اصلی اعتبارسنجی ---
  function validateForm() {
    let isValid = true;
    const errors = []; // Use an array to collect error messages if needed

    // --- General Fields ---
    if (!validatePersian('firstName', 'firstNameError', 'نام')) isValid = false;
    if (!validatePersian('lastName', 'lastNameError', 'نام خانوادگی')) isValid = false;
    if (!validatePhone('phone', 'phoneError', 'شماره تماس')) isValid = false;    // altPhone is optional

    // --- Property Type ---
    const propertyTypeRadio = document.querySelector('input[name="propertyType"]:checked');
    if (!propertyTypeRadio) {
      typeErrorDiv.classList.remove('hidden');
      isValid = false;
      errors.push('نوع ملک');
    } else {
      typeErrorDiv.classList.add('hidden');
      const propertyType = propertyTypeRadio.value;
      let sectionId = ''; // ID of the currently visible section div

      // --- Validate fields within the *active* section ---
      switch (propertyType) {
        case 'آپارتمان':
          sectionId = 'apartmentDetails';
          if (!validateNumeric('unitArea-apartment', 'unitArea-apartmentError', 'متراژ واحد')) isValid = false;
          if (!validateNumeric('roomCount-apartment', 'roomCount-apartmentError', 'تعداد اتاق‌ها')) isValid = false;
          if (!validateNumeric('buildYear-apartment', 'buildYear-apartmentError', 'سال ساخت')) isValid = false;
          if (!validateRadioGroup('document', 'document-apartmentError', 'وضعیت سند', sectionId)) isValid = false; // Use shared name, unique error ID
          if (!validateNumeric('totalPrice-apartment', 'totalPrice-apartmentError', 'قیمت کلی')) isValid = false;
          if (!validateCheckboxGroup('saleConditions', 'saleConditions-apartmentError', 'شرط فروش', sectionId)) isValid = false; // Use shared name, unique error ID
          if (!validatePersian('address-apartment', 'address-apartmentError', 'آدرس')) isValid = false;
          // Optional fields don't need 'isValid = false' but can still show format errors
          validateNumeric('landArea-apartment', 'landArea-apartmentError', 'متراژ زمین', false); // false = not required
          validatePersian('otherDetails-apartment', 'otherDetails-apartmentError', 'سایر توضیحات', false);
          validatePersian('saleConditionDetails-apartment', 'saleConditionDetails-apartmentError', 'توضیحات شرایط فروش', false);
          break;

        case 'ویلا':
          sectionId = 'villaDetails';
          if (!validateNumeric('landArea-villa', 'landArea-villaError', 'متراژ زمین')) isValid = false;
          if (!validateNumeric('buildingArea-villa', 'buildingArea-villaError', 'متراژ بنا')) isValid = false;
          if (!validateNumeric('roomCount-villa', 'roomCount-villaError', 'تعداد اتاق‌ها')) isValid = false;
          if (!validateNumeric('buildYear-villa', 'buildYear-villaError', 'سال ساخت')) isValid = false;
          if (!validateRadioGroup('document', 'document-villaError', 'وضعیت سند', sectionId)) isValid = false;
          if (!validateNumeric('price-villa', 'price-villaError', 'قیمت کلی')) isValid = false;
          if (!validateCheckboxGroup('saleConditions', 'saleConditions-villaError', 'شرط فروش', sectionId)) isValid = false;
          if (!validatePersian('address-villa', 'address-villaError', 'آدرس')) isValid = false;
          validatePersian('otherDetails-villa', 'otherDetails-villaError', 'سایر توضیحات', false);
          validatePersian('saleConditionDetails-villa', 'saleConditionDetails-villaError', 'توضیحات شرایط فروش', false);
          validatePersian('otherFacilities-villa', 'otherFacilities-villaError', 'سایر تاسیسات', false);
          validatePersian('otherAmenities-villa', 'otherAmenities-villaError', 'سایر امکانات', false);
          break;

        case 'زمین':
           sectionId = 'landDetails';
           if (!validateNumeric('landArea-land', 'landArea-landError', 'متراژ زمین')) isValid = false;
           if (!validatePersian('landUsage', 'landUsageError', 'کاربری')) isValid = false;
           if (!validateRadioGroup('document', 'document-landError', 'وضعیت سند', sectionId)) isValid = false;
           if (!validateNumeric('totalPrice-land', 'totalPrice-landError', 'قیمت کلی')) isValid = false;
           if (!validateCheckboxGroup('saleConditions', 'saleConditions-landError', 'شرط فروش', sectionId)) isValid = false;
           if (!validatePersian('address-land', 'address-landError', 'آدرس')) isValid = false;
           validateNumeric('landWidth', 'landWidthError', 'بر زمین', false); // Assuming error IDs exist or are added
           validateNumeric('landDepth', 'landDepthError', 'عمق زمین', false);
           validateNumeric('alleyWidth', 'alleyWidthError', 'عرض کوچه', false);
           validatePersian('otherDetails-land', 'otherDetails-landError', 'سایر توضیحات', false);
           validatePersian('saleConditionDetails-land', 'saleConditionDetails-landError', 'توضیحات شرایط فروش', false);
           break;

        case 'تجاری':
            sectionId = 'commercialDetails';
            if (!validateNumeric('shopArea', 'shopAreaError', 'متراژ مغازه')) isValid = false;
            if (!validateRadioGroup('document', 'document-commercialError', 'وضعیت سند', sectionId)) isValid = false;
            if (!validateNumeric('totalPrice-commercial', 'totalPrice-commercialError', 'قیمت کلی')) isValid = false;
            if (!validateCheckboxGroup('saleConditions', 'saleConditions-commercialError', 'شرط فروش', sectionId)) isValid = false;
            if (!validatePersian('address-commercial', 'address-commercialError', 'آدرس')) isValid = false;
            validateNumeric('shopHeight', 'shopHeightError', 'ارتفاع مغازه', false);
            validateNumeric('shopWidth', 'shopWidthError', 'دهنه مغازه', false);
            validatePersian('shopDetails', 'shopDetailsError', 'توضیحات شکل مغازه', false);
            validatePersian('otherDetails-commercial', 'otherDetails-commercialError', 'امکانات', false);
            validatePersian('saleConditionDetails-commercial', 'saleConditionDetails-commercialError', 'توضیحات شرایط فروش', false);
            break;

        case 'کلنگی':
            sectionId = 'oldDetails';
            if (!validateNumeric('landArea-old', 'landArea-oldError', 'متراژ زمین')) isValid = false;
            if (!validateNumeric('buildingArea-old', 'buildingArea-oldError', 'متراژ بنا')) isValid = false;
            if (!validateRadioGroup('document', 'document-oldError', 'وضعیت سند', sectionId)) isValid = false;
            if (!validateNumeric('totalPrice-old', 'totalPrice-oldError', 'قیمت کلی')) isValid = false;
            if (!validateCheckboxGroup('saleConditions', 'saleConditions-oldError', 'شرط فروش', sectionId)) isValid = false;
            if (!validatePersian('address-old', 'address-oldError', 'آدرس')) isValid = false;
            validateNumeric('landWidth-old', 'landWidth-oldError', 'بر زمین', false);
            validateNumeric('landDepth-old', 'landDepth-oldError', 'عمق زمین', false);
            validatePersian('amenities-old', 'amenities-oldError', 'امکانات', false);
            validatePersian('saleConditionDetails-old', 'saleConditionDetails-oldError', 'توضیحات شرایط فروش', false);
            break;

        case 'پیش‌فروش':
            const presaleTypeRadio = document.querySelector('input[name="presaleType"]:checked');
            const presaleTypeErrorDiv = document.getElementById('presaleTypeError'); // Assuming this ID exists
            if (!presaleTypeRadio) {
                isValid = false;
                if(presaleTypeErrorDiv) presaleTypeErrorDiv.classList.remove('hidden');
                errors.push('نوع پیش‌فروش');
            } else {
                 if(presaleTypeErrorDiv) presaleTypeErrorDiv.classList.add('hidden');
                 const presaleType = presaleTypeRadio.value;

                 // Validate Project Progress (always required for presale)
                 if (!validateRequired('projectProgress', 'projectProgressError', 'مرحله پروژه')) isValid = false;


                 if (presaleType === 'آپارتمان') {
                     sectionId = 'presaleApartmentDetails';
                     if (!validateNumeric('unitArea-presale-apartment', 'unitArea-presale-apartmentError', 'متراژ واحد')) isValid = false;
                     if (!validateNumeric('roomCount-presale-apartment', 'roomCount-presale-apartmentError', 'تعداد اتاق')) isValid = false;
                     if (!validateRadioGroup('document', 'document-presale-apartmentError', 'وضعیت سند', sectionId)) isValid = false;
                     if (!validateNumeric('totalPrice-presale-apartment', 'totalPrice-presale-apartmentError', 'قیمت کلی')) isValid = false;
                     if (!validateCheckboxGroup('saleConditions', 'saleConditions-presale-apartmentError', 'شرط فروش', sectionId)) isValid = false;
                     if (!validatePersian('address-presale-apartment', 'address-presale-apartmentError', 'آدرس')) isValid = false;
                     validateNumeric('landArea-presale-apartment', 'landArea-presale-apartmentError', 'متراژ زمین', false);
                     validateNumeric('floorCount-presale-apartment', 'floorCount-presale-apartmentError', 'تعداد طبقه', false);
                     validateNumeric('floorNumber-presale-apartment', 'floorNumber-presale-apartmentError', 'طبقه چندم', false);
                     validateNumeric('unitsPerFloor-presale-apartment', 'unitsPerFloor-presale-apartmentError', 'واحد در طبقه', false);
                     validatePersian('moreDetails-presale-apartment', 'moreDetails-presale-apartmentError', 'توضیحات بیشتر', false);
                     validatePersian('otherDetails-presale-apartment', 'otherDetails-presale-apartmentError', 'سایر توضیحات', false);
                     validatePersian('saleConditionDetails-presale-apartment', 'saleConditionDetails-presale-apartmentError', 'توضیحات شرایط فروش', false);

                 } else { // ویلا
                     sectionId = 'presaleVillaDetails';
                     if (!validateNumeric('landArea-presale-villa', 'landArea-presale-villaError', 'متراژ زمین')) isValid = false;
                     if (!validateNumeric('buildingArea-presale-villa', 'buildingArea-presale-villaError', 'متراژ بنا')) isValid = false;
                     if (!validateNumeric('roomCount-presale-villa', 'roomCount-presale-villaError', 'تعداد اتاق')) isValid = false;
                     if (!validateNumeric('floorCount-presale-villa', 'floorCount-presale-villaError', 'تعداد طبقات')) isValid = false;
                     if (!validateRadioGroup('document', 'document-presale-villaError', 'وضعیت سند', sectionId)) isValid = false;
                     if (!validateNumeric('price-presale-villa', 'price-presale-villaError', 'قیمت کلی')) isValid = false;
                     if (!validateCheckboxGroup('saleConditions', 'saleConditions-presale-villaError', 'شرط فروش', sectionId)) isValid = false;
                     if (!validatePersian('address-presale-villa', 'address-presale-villaError', 'آدرس')) isValid = false;
                     validatePersian('otherDetails-presale-villa', 'otherDetails-presale-villaError', 'سایر توضیحات', false);
                     validatePersian('saleConditionDetails-presale-villa', 'saleConditionDetails-presale-villaError', 'توضیحات شرایط فروش', false);
                 }
            }
            break;
      }
    }

    // --- نمایش خطاهای کلی ---
    if (!isValid) {
      errorsListUl.innerHTML = ''; // Clear previous errors
      // Use Set to remove duplicates if errors array was populated
      [...new Set(errors)].forEach(errMsg => {
          const li = document.createElement('li');
          li.textContent = errMsg;
          errorsListUl.appendChild(li);
      });
      // Add general message if specific field errors are shown inline
      if (errorsListUl.children.length === 0 && document.querySelector('.error-field')) {
           const li = document.createElement('li');
           li.textContent = "لطفاً فیلدهای مشخص شده را اصلاح کنید.";
           errorsListUl.appendChild(li);
      }      validationErrorsDiv.classList.remove('hidden');
    } else {
      validationErrorsDiv.classList.add('hidden');
    }

    return isValid;
  }


  // --- توابع Firebase ---
  function uploadImagesToFirebase(files) {
    if (!files || files.length === 0) {
        console.log("No files to upload."); // Debug log
        return Promise.resolve([]); // Resolve with empty array if no files
    }

    const uploadPromises = files.map((file, index) => {
        const timestamp = Date.now();
        // Sanitize filename (replace spaces, special chars)
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${timestamp}_${safeFileName}`;
        const storageRef = storage.ref(`property_images/${fileName}`);
        const uploadTask = storageRef.put(file);

        // --- Progress Bar Handling (Optional but recommended) ---
        const progressId = `progress-${index}`; // Use original index for ID
        let progressDiv = document.getElementById(progressId);
        // Find the corresponding preview item using data-file-index
        const previewItem = document.querySelector(`.image-preview-item[data-file-index="${index}"]`);

        if (!progressDiv && previewItem) { // Create progress bar only if preview exists
            progressDiv = document.createElement('div');
            progressDiv.id = progressId;
            progressDiv.className = 'progress mt-1 mb-1'; // Smaller margins
            progressDiv.style.height = '5px'; // Make it thinner
            progressDiv.innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: 0%; font-size: 8px; line-height: 5px;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>`;
            previewItem.appendChild(progressDiv); // Append to the preview item
        }
        const progressBar = progressDiv ? progressDiv.querySelector('.progress-bar') : null;
        // --- End Progress Bar Handling ---


        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    if (progressBar) {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        progressBar.style.width = progress + '%';
                        progressBar.setAttribute('aria-valuenow', progress);
                        // progressBar.textContent = progress + '%'; // Remove text for thin bar
                    }
                },
                (error) => {
                    console.error(`Upload failed for ${fileName}:`, error);
                    if (progressBar) {
                        progressBar.classList.remove('progress-bar-animated', 'bg-info');
                        progressBar.classList.add('bg-danger');
                        progressBar.style.width = '100%';
                        // progressBar.textContent = 'خطا';
                    }
                    reject(error); // Reject the promise for this file
                },
                () => {
                    // Upload completed successfully
                     if (progressBar) {
                        progressBar.classList.remove('progress-bar-animated', 'bg-info');
                        progressBar.classList.add('bg-success');
                        // progressBar.textContent = '✓'; // Checkmark or nothing
                    }
                    uploadTask.snapshot.ref.getDownloadURL()
                        .then(downloadURL => {
                            console.log(`File ${fileName} uploaded: ${downloadURL}`); // Debug log
                            resolve(downloadURL); // Resolve with the URL
                        })
                        .catch(reject); // Handle errors getting URL
                }            );
        });
    });

    // Wait for all uploads to settle (either complete or fail)
    // Use Promise.allSettled if you want to proceed even if some uploads fail
    // Use Promise.all if you want to fail the whole process if any upload fails
    return Promise.all(uploadPromises);
}


  function saveDataToFirebase(data) {
    const newPropertyRef = database.ref('properties').push();
    return newPropertyRef.set(data);
  }

  // --- تابع جمع‌آوری داده‌ها (اصلاح شده برای کار با name مشترک) ---
  function collectFormData() {
      const propertyTypeRadio = document.querySelector('input[name="propertyType"]:checked');
      if (!propertyTypeRadio) return null; // Should not happen if validation passed

      const propertyType = propertyTypeRadio.value;
      let activeSection; // The div element of the active section
      let formData = {
          firstName: document.getElementById('firstName').value.trim(),
          lastName: document.getElementById('lastName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          altPhone: document.getElementById('altPhone').value.trim() || null, // Use null for empty optional
          propertyType: propertyType,
          // dateTime and images will be added later
      };

      // Helper to get value from input within the active section
      function getValue(selector) {
          const element = activeSection ? activeSection.querySelector(selector) : null;
          return element ? element.value.trim() : null;
      }

      // Helper to get checked radio value within the active section
      function getRadioValue(name) {
          const element = activeSection ? activeSection.querySelector(`input[name="${name}"]:checked`) : null;
          return element ? element.value : null;
      }

      // Helper to get checked checkbox values within the active section
      function getCheckboxValues(name) {
          const elements = activeSection ? activeSection.querySelectorAll(`input[name="${name}"]:checked`) : [];
          return Array.from(elements).map(el => el.value);
      }

      switch (propertyType) {
          case 'آپارتمان': activeSection = formSections.apartment; break;
          case 'ویلا': activeSection = formSections.villa; break;
          case 'زمین': activeSection = formSections.land; break;
          case 'تجاری': activeSection = formSections.commercial; break;
          case 'کلنگی': activeSection = formSections.old; break;
          case 'پیش‌فروش':
              const presaleTypeRadio = document.querySelector('input[name="presaleType"]:checked');
              if (presaleTypeRadio) {
                  formData.presaleType = presaleTypeRadio.value;
                  formData.projectProgress = document.getElementById('projectProgress').value.trim();
                  if (formData.presaleType === 'آپارتمان') {
                      activeSection = formSections.presaleApartment;
                  } else {
                      activeSection = formSections.presaleVilla;
                  }
              }
              break;
      }

      if (!activeSection) {
          console.error("Could not determine active section for data collection.");
          return formData; // Return basic data at least
      }

      // Collect data based on property type using helpers and activeSection
      if (propertyType === 'آپارتمان') {
          formData.landArea = getValue('#landArea-apartment');
          formData.unitArea = getValue('#unitArea-apartment');
          formData.roomCount = getValue('#roomCount-apartment');
          formData.buildYear = getValue('#buildYear-apartment');
          formData.kitchen = getCheckboxValues('kitchen-apartment');
          formData.facilities = getCheckboxValues('facilities-apartment');
          formData.otherFacilities = getValue('#otherFacilities-apartment');
          formData.amenities = getCheckboxValues('amenities-apartment');
          formData.otherAmenities = getValue('#otherAmenities-apartment');
          formData.commonAreas = getCheckboxValues('commonAreas-apartment');
          formData.otherCommonAreas = getValue('#otherCommonAreas-apartment');
          formData.otherDetails = getValue('#otherDetails-apartment');
          formData.document = getRadioValue('document'); // Shared name
          formData.pricePerMeter = getValue('#pricePerMeter-apartment');
          formData.totalPrice = getValue('#totalPrice-apartment');
          formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
          formData.saleConditionDetails = getValue('#saleConditionDetails-apartment');
          formData.address = getValue('#address-apartment');
      } else if (propertyType === 'ویلا') {
          formData.landArea = getValue('#landArea-villa');
          formData.buildingArea = getValue('#buildingArea-villa');
          formData.roomCount = getValue('#roomCount-villa');
          formData.buildYear = getValue('#buildYear-villa');
          formData.kitchen = getCheckboxValues('kitchen-villa');
          formData.facilities = getCheckboxValues('facilities-villa');
          formData.otherFacilities = getValue('#otherFacilities-villa');
          formData.amenities = getCheckboxValues('amenities-villa');
          formData.otherAmenities = getValue('#otherAmenities-villa');
          formData.otherDetails = getValue('#otherDetails-villa');
          formData.document = getRadioValue('document'); // Shared name
          formData.price = getValue('#price-villa'); // Villa has 'price' not 'totalPrice'
          formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
          formData.saleConditionDetails = getValue('#saleConditionDetails-villa');
          formData.address = getValue('#address-villa');
      } else if (propertyType === 'زمین') {
          formData.landArea = getValue('#landArea-land');
          formData.landUsage = getValue('#landUsage');
          formData.landWidth = getValue('#landWidth');
          formData.landDepth = getValue('#landDepth');
          formData.alleyWidth = getValue('#alleyWidth');
          formData.enclosed = activeSection.querySelector('input[name="enclosed"]:checked')?.value || null; // Specific name
          formData.otherDetails = getValue('#otherDetails-land');
          formData.document = getRadioValue('document'); // Shared name
          formData.pricePerMeter = getValue('#pricePerMeter-land');
          formData.totalPrice = getValue('#totalPrice-land');
          formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
          formData.saleConditionDetails = getValue('#saleConditionDetails-land');
          formData.address = getValue('#address-land');
      } else if (propertyType === 'تجاری') {
          formData.shopArea = getValue('#shopArea');
          formData.shopHeight = getValue('#shopHeight');
          formData.shopWidth = getValue('#shopWidth');
          formData.shopDetails = getValue('#shopDetails');
          formData.otherDetails = getValue('#otherDetails-commercial'); // Used for 'امکانات'
          formData.document = getRadioValue('document'); // Shared name
          formData.pricePerMeter = getValue('#pricePerMeter-commercial');
          formData.totalPrice = getValue('#totalPrice-commercial');
          formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
          formData.saleConditionDetails = getValue('#saleConditionDetails-commercial');
          formData.address = getValue('#address-commercial');
      } else if (propertyType === 'کلنگی') {
          formData.landArea = getValue('#landArea-old');
          formData.buildingArea = getValue('#buildingArea-old');
          formData.landWidth = getValue('#landWidth-old');
          formData.landDepth = getValue('#landDepth-old');
          formData.livability = activeSection.querySelector('input[name="livability"]:checked')?.value || null; // Specific name
          formData.utilities = getCheckboxValues('utilities'); // Specific name
          formData.amenities = getValue('#amenities-old'); // Used for 'امکانات'
          formData.document = getRadioValue('document'); // Shared name
          formData.pricePerMeter = getValue('#pricePerMeter-old');
          formData.totalPrice = getValue('#totalPrice-old');
          formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
          formData.saleConditionDetails = getValue('#saleConditionDetails-old');
          formData.address = getValue('#address-old');
      } else if (propertyType === 'پیش‌فروش' && activeSection) {
          // presaleType and projectProgress already added
          if (formData.presaleType === 'آپارتمان') {
              formData.landArea = getValue('#landArea-presale-apartment');
              formData.unitArea = getValue('#unitArea-presale-apartment');
              formData.roomCount = getValue('#roomCount-presale-apartment');
              formData.floorCount = getValue('#floorCount-presale-apartment');
              formData.floorNumber = getValue('#floorNumber-presale-apartment');
              formData.unitsPerFloor = getValue('#unitsPerFloor-presale-apartment');
              formData.moreDetails = getValue('#moreDetails-presale-apartment');
              formData.kitchen = getCheckboxValues('kitchen-presale-apartment'); // Specific name
              formData.otherDetails = getValue('#otherDetails-presale-apartment');
              formData.document = getRadioValue('document'); // Shared name
              formData.pricePerMeter = getValue('#pricePerMeter-presale-apartment');
              formData.totalPrice = getValue('#totalPrice-presale-apartment');
              formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
              formData.saleConditionDetails = getValue('#saleConditionDetails-presale-apartment');
              formData.address = getValue('#address-presale-apartment');
          } else { // Villa
              formData.landArea = getValue('#landArea-presale-villa');
              formData.buildingArea = getValue('#buildingArea-presale-villa');
              formData.roomCount = getValue('#roomCount-presale-villa');
              formData.floorCount = getValue('#floorCount-presale-villa');
              formData.kitchen = getCheckboxValues('kitchen-presale-villa'); // Specific name
              formData.otherDetails = getValue('#otherDetails-presale-villa');
              formData.document = getRadioValue('document'); // Shared name
              formData.price = getValue('#price-presale-villa'); // Presale Villa has 'price'
              formData.saleConditions = getCheckboxValues('saleConditions'); // Shared name
              formData.saleConditionDetails = getValue('#saleConditionDetails-presale-villa');
              formData.address = getValue('#address-presale-villa');
          }
      }

       // Clean up empty/null values before returning (optional)
       Object.keys(formData).forEach(key => {
           if (formData[key] === "" || formData[key] === null || (Array.isArray(formData[key]) && formData[key].length === 0)) {
               delete formData[key]; // Remove empty/null/empty arrays
           }
       });


      return formData;
  }


  // --- محاسبات قیمت (بدون تغییر عمده، فقط بررسی وجود عناصر) ---
  function setupPriceCalculation(areaInputId, pricePerMeterInputId, totalPriceInputId) {
      const areaInput = document.getElementById(areaInputId);
      const pricePerMeterInput = document.getElementById(pricePerMeterInputId);
      const totalPriceInput = document.getElementById(totalPriceInputId);

      if (!areaInput || !pricePerMeterInput || !totalPriceInput) return; // Skip if any element is missing

      function calculate() {
          const area = parseFloat(areaInput.value.replace(/,/g, '').replace(/٬/g, '')) || 0;
          const pricePerMeter = parseFloat(pricePerMeterInput.value.replace(/,/g, '').replace(/٬/g, '')) || 0;
          if (area > 0 && pricePerMeter > 0) {
              totalPriceInput.value = (area * pricePerMeter).toLocaleString('fa-IR');
          } else if (!pricePerMeterInput.value.trim()) {
              // Keep total price if price per meter is cleared, or clear it too:
              // totalPriceInput.value = '';
          }
      }

      areaInput.addEventListener('input', calculate);
      pricePerMeterInput.addEventListener('input', calculate);      // Recalculate on blur from price per meter for better UX
      pricePerMeterInput.addEventListener('blur', calculate);
  }

  setupPriceCalculation('unitArea-apartment', 'pricePerMeter-apartment', 'totalPrice-apartment');
  setupPriceCalculation('landArea-land', 'pricePerMeter-land', 'totalPrice-land');
  setupPriceCalculation('shopArea', 'pricePerMeter-commercial', 'totalPrice-commercial');
  setupPriceCalculation('landArea-old', 'pricePerMeter-old', 'totalPrice-old');
  setupPriceCalculation('unitArea-presale-apartment', 'pricePerMeter-presale-apartment', 'totalPrice-presale-apartment');
  // Note: Villa and Presale Villa only have total price, no calculation needed here.


  // --- فرمت‌دهی ورودی‌ها (بدون تغییر عمده) ---  const priceInputs = document.querySelectorAll('.price-input');
  priceInputs.forEach(input => {
      function formatPrice() {
          let value = input.value.replace(/\D/g, '');
          if (value) {
              input.value = parseInt(value).toLocaleString('fa-IR');
          } else {
              input.value = '';
          }
      }
      input.addEventListener('input', formatPrice);
      input.addEventListener('blur', formatPrice); // Format on blur too
      formatPrice(); // Format on load
  });

  const numericInputs = document.querySelectorAll('.numeric-only');
  numericInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  });

  // Initial call to hide sections on load
  hideAllSections();
  console.log("Initial setup complete."); // Debug log

}); // End DOMContentLoaded