// تنظیمات Firebase (باید با frontend یکی باشد)
const firebaseConfig = {
  apiKey: "AIzaSyBIcS9FeIQF0g0Hm_oYQgcGQHQy_HZKwjk",
  authDomain: "amlak-form-app.firebaseapp.com",
  databaseURL: "https://amlak-form-app-default-rtdb.firebaseio.com",
  projectId: "amlak-form-app",
  storageBucket: "amlak-form-app.appspot.com",
  messagingSenderId: "657326173887",
  appId: "1:657326173887:web:d7c3a9b3e4d4c7c1b0a5a0"};

// مقداردهی اولیه Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
    // Display error to user?
    document.body.innerHTML = '<div class="alert alert-danger m-5 text-center">خطا در اتصال به سرویس. لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.</div>';
}

const database = firebase.database();
const storage = firebase.storage();

// --- متغیرهای سراسری ---
let allPropertiesData = []; // برای نگهداری داده‌های خام از Firebase
let currentFilterType = 'all';
let currentSortBy = 'newest';
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin Panel DOM loaded.");

    // --- عناصر DOM ---
    // Login elements are no longer needed
    // const loginSection = document.getElementById('loginSection');
    // const loginForm = document.getElementById('loginForm');
    // const usernameInput = document.getElementById('username');
    // const passwordInput = document.getElementById('password');
    // const loginErrorDiv = document.getElementById('loginError');
    // const logoutBtn = document.getElementById('logoutBtn');

    const adminPanel = document.getElementById('adminPanel'); // Panel should be visible by default now
    const filterTypeSelect = document.getElementById('filterType');
    const sortBySelect = document.getElementById('sortBy');
    const searchInput = document.getElementById('searchInput');
    const propertiesListDiv = document.getElementById('propertiesList');
    const noPropertiesDiv = document.getElementById('noProperties');
    const initialLoadingDiv = document.getElementById('initialLoading');
    const backupBtn = document.getElementById('backupBtn');
    const clearBtn = document.getElementById('clearBtn');
    const restoreFile = document.getElementById('restoreFile');
    const restoreBtn = document.getElementById('restoreBtn');
    const imageFullscreenOverlay = document.getElementById('imageFullscreenOverlay');
    const fullscreenImage = document.getElementById('fullscreenImage');
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const processingOverlay = document.getElementById('processingOverlay');

    // --- توابع (همانند قبل، بدون تغییر در منطق اصلی) ---

    function showOverlay(overlayElement) { if (overlayElement) overlayElement.classList.remove('hidden'); }
    function hideOverlay(overlayElement) { if (overlayElement) overlayElement.classList.add('hidden'); }

    // گوش دادن به تغییرات داده‌ها در Firebase (Real-time)
    function listenForProperties() {
        console.log("Listening for properties...");
        // Show initial loading message only if the div exists
        if (initialLoadingDiv) initialLoadingDiv.classList.remove('hidden');
        if (propertiesListDiv) propertiesListDiv.innerHTML = ''; // Clear previous list
        if (noPropertiesDiv) noPropertiesDiv.classList.add('hidden');
        // No general loading overlay here, let initialLoadingDiv handle it

        const propertiesRef = database.ref('properties');
        propertiesRef.off('value'); // Ensure no duplicate listeners

        propertiesRef.on('value', (snapshot) => {
            allPropertiesData = [];
            if (snapshot.exists()) {                snapshot.forEach(childSnapshot => {
                    const property = childSnapshot.val();
                    property.key = childSnapshot.key;
                    allPropertiesData.push(property);
                });
                console.log(`Loaded ${allPropertiesData.length} properties.`);
            } else {
                console.log("No properties found in database.");
            }
            if (initialLoadingDiv) initialLoadingDiv.classList.add('hidden');
            applyFiltersAndDisplay(); // Apply filters and display data
        }, (error) => {
            console.error('Error fetching properties:', error);
            if (initialLoadingDiv) initialLoadingDiv.classList.add('hidden');
            if (propertiesListDiv) propertiesListDiv.innerHTML = '<div class="alert alert-danger">خطا در بارگیری اطلاعات. لطفاً اتصال اینترنت و قوانین Firebase را بررسی کنید.</div>';
        });
    }    // اعمال فیلترها و مرتب‌سازی و نمایش (بدون تغییر)
    function applyFiltersAndDisplay() {
        console.log(`Filtering/Sorting: Type=${currentFilterType}, Sort=${currentSortBy}, Search=${currentSearchTerm}`);
        let filteredProperties = [...allPropertiesData];        // 1. Filter by Type
        if (currentFilterType !== 'all') {
            filteredProperties = filteredProperties.filter(p => p.propertyType === currentFilterType);
        }

        // 2. Filter by Search Term
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            filteredProperties = filteredProperties.filter(p => {
                const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
                const address = (p.address || '').toLowerCase();
                const phone = (p.phone || '').toLowerCase();
                const altPhone = (p.altPhone || '').toLowerCase();
                return fullName.includes(term) || address.includes(term) || phone.includes(term) || altPhone.includes(term);
            });
        }

        // 3. Sort
        filteredProperties.sort((a, b) => {
            switch (currentSortBy) {
                case 'oldest': return new Date(a.dateTime || 0) - new Date(b.dateTime || 0);
                case 'priceHigh':
                    const priceAHigh = parseInt((a.totalPrice || a.price || '0').replace(/,/g, '')) || 0;
                    const priceBHigh = parseInt((b.totalPrice || b.price || '0').replace(/,/g, '')) || 0;
                    return priceBHigh - priceAHigh;                case 'priceLow':
                    const priceALow = parseInt((a.totalPrice || a.price || '0').replace(/,/g, '')) || 0;
                    const priceBLow = parseInt((b.totalPrice || b.price || '0').replace(/,/g, '')) || 0;
                    return priceALow - priceBLow;
                case 'newest': default: return new Date(b.dateTime || 0) - new Date(a.dateTime || 0);
            }
        });

        console.log(`Displaying ${filteredProperties.length} properties after filtering/sorting.`);
        displayProperties(filteredProperties);
    }

    // نمایش املاک در لیست (بدون تغییر)
    function displayProperties(properties) {
        if (!propertiesListDiv || !noPropertiesDiv) return; // Exit if elements missing
        propertiesListDiv.innerHTML = '';
        if (initialLoadingDiv) initialLoadingDiv.classList.add('hidden');

        if (properties.length === 0) {
            noPropertiesDiv.classList.remove('hidden');
            return;
        }
        noPropertiesDiv.classList.add('hidden');

        properties.forEach((property) => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.id = `card-${property.key}`;

            let title = `${property.propertyType || 'نوع نامشخص'}`;
            if (property.propertyType === 'پیش‌فروش' && property.presaleType) {
                title += ` (${property.presaleType})`;
            }
            const address = property.address || 'آدرس نامشخص';
            const priceValue = property.totalPrice || property.price;
            const price = priceValue ? `${priceValue} تومان` : 'قیمت نامشخص';
            let dateTimeFormatted = 'نامشخص';
            if (property.dateTime) {
                try {
                    dateTimeFormatted = new Date(property.dateTime).toLocaleString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                } catch (e) { dateTimeFormatted = property.dateTime; }
            }
            let imagesHTML = '<p>بدون تصویر</p>';
            if (property.images && Array.isArray(property.images) && property.images.length > 0) {
                imagesHTML = property.images.map(imgUrl => `<img src="${imgUrl}" alt="تصویر ملک" loading="lazy" onclick="showFullImage('${imgUrl}')">`).join('');
            }

            card.innerHTML = `
                <div class="card-spinner-overlay hidden"> <div class="spinner-border text-danger" role="status"><span class="visually-hidden">در حال حذف...</span></div> </div>
                <h3>${title}</h3>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="property-info">
                             <p><strong>مالک:</strong> ${property.firstName || ''} ${property.lastName || ''}</p>
                             <p><strong>تماس اصلی:</strong> <a href="tel:${property.phone || ''}">${property.phone || 'ندارد'}</a></p>
                             ${property.altPhone ? `<p><strong>تماس دوم:</strong> <a href="tel:${property.altPhone}">${property.altPhone}</a></p>` : ''}
                             <p><strong>آدرس:</strong> ${address}</p>
                             <p><strong>قیمت:</strong> ${price}</p>
                             <p class="date-time"><strong>تاریخ ثبت:</strong> ${dateTimeFormatted}</p>
                        </div>
                    </div>
                    <div class="col-lg-6">
                         <h5>تصاویر:</h5>
                         <div class="property-images">${imagesHTML}</div>
                    </div>
                </div>
                <div class="mt-3 text-center text-md-end">
                    <button class="btn btn-sm btn-info btn-action" onclick="toggleDetails('${property.key}', this)"><i class="fas fa-info-circle me-1"></i> جزئیات</button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteProperty('${property.key}')"><i class="fas fa-trash-alt me-1"></i> حذف</button>
                </div>
                <div class="property-details hidden mt-3" id="details-${property.key}"></div>`;
            propertiesListDiv.appendChild(card);
        });
    }

    // نمایش / پنهان کردن جزئیات بیشتر (بدون تغییر)
    window.toggleDetails = function(propertyKey, buttonElement) { // Make globally accessible
        const detailsDiv = document.getElementById(`details-${propertyKey}`);
        if (!detailsDiv) return;        const property = allPropertiesData.find(p => p.key === propertyKey);
        if (!property) return;

        if (detailsDiv.classList.contains('hidden')) {
            detailsDiv.classList.remove('hidden');
            buttonElement.innerHTML = '<i class="fas fa-minus-circle me-1"></i> بستن جزئیات';
            buttonElement.classList.replace('btn-info', 'btn-secondary');
            let detailsHTML = '<h5>جزئیات کامل ملک</h5><div class="row">';
            const addDetail = (label, value) => {
                if (value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                    const displayValue = Array.isArray(value) ? value.join('، ') : value;
                    return `<p class="col-md-6"><strong>${label}:</strong> ${displayValue}</p>`;
                } return '';
            };
            // Add all details... (same logic as before)
            detailsHTML += addDetail("نوع ملک", property.propertyType);
            if (property.propertyType === 'پیش‌فروش') { detailsHTML += addDetail("نوع پیش‌فروش", property.presaleType); detailsHTML += addDetail("مرحله پروژه", property.projectProgress); }
            detailsHTML += addDetail("متراژ زمین", property.landArea ? `${property.landArea} متر` : null);            detailsHTML += addDetail("متراژ واحد/بنا", property.unitArea || property.buildingArea ? `${property.unitArea || property.buildingArea} متر` : null);
            detailsHTML += addDetail("متراژ مغازه", property.shopArea ? `${property.shopArea} متر` : null);
            detailsHTML += addDetail("تعداد اتاق", property.roomCount);
            detailsHTML += addDetail("سال ساخت", property.buildYear);
            detailsHTML += addDetail("طبقات", property.floorCount);
            detailsHTML += addDetail("طبقه", property.floorNumber);
            detailsHTML += addDetail("واحد در طبقه", property.unitsPerFloor);
            detailsHTML += addDetail("بَر زمین", property.landWidth ? `${property.landWidth} متر` : null);
            detailsHTML += addDetail("عمق زمین", property.landDepth ? `${property.landDepth} متر` : null);
            detailsHTML += addDetail("عرض کوچه", property.alleyWidth ? `${property.alleyWidth} متر` : null);
            detailsHTML += addDetail("ارتفاع مغازه", property.shopHeight ? `${property.shopHeight} متر` : null);
            detailsHTML += addDetail("دهنه مغازه", property.shopWidth ? `${property.shopWidth} متر` : null);
            detailsHTML += addDetail("کاربری زمین", property.landUsage);
            detailsHTML += addDetail("محصور", property.enclosed);
            detailsHTML += addDetail("وضعیت سکونت (کلنگی)", property.livability);
            detailsHTML += addDetail("وضعیت سند", property.document);
            detailsHTML += addDetail("قیمت متری", property.pricePerMeter ? `${property.pricePerMeter} تومان` : null);
            detailsHTML += addDetail("قیمت کلی", property.totalPrice || property.price ? `${property.totalPrice || property.price} تومان` : null);
            detailsHTML += addDetail("شرایط فروش", property.saleConditions);
            detailsHTML += addDetail("توضیحات شرایط", property.saleConditionDetails);
            detailsHTML += addDetail("آشپزخانه", property.kitchen);
            detailsHTML += addDetail("تاسیسات", property.facilities);
            detailsHTML += addDetail("سایر تاسیسات", property.otherFacilities);
            detailsHTML += addDetail("امکانات", property.amenities);
            detailsHTML += addDetail("سایر امکانات", property.otherAmenities);
            detailsHTML += addDetail("مشاعات", property.commonAreas);            detailsHTML += addDetail("سایر مشاعات", property.otherCommonAreas);
            detailsHTML += addDetail("امتیازات (کلنگی)", property.utilities);
            // detailsHTML += addDetail("امکانات (کلنگی)", property.amenitiesOld); // Check field name
            detailsHTML += addDetail("توضیحات شکل مغازه", property.shopDetails);
            detailsHTML += addDetail("توضیحات بیشتر (پیش‌فروش)", property.moreDetails);
            detailsHTML += addDetail("سایر توضیحات", property.otherDetails);
            // Add any other fields you have stored...
            detailsHTML += '</div>';
            detailsDiv.innerHTML = detailsHTML;
        } else {
            detailsDiv.classList.add('hidden');
            detailsDiv.innerHTML = '';
            buttonElement.innerHTML = '<i class="fas fa-info-circle me-1"></i> جزئیات';
            buttonElement.classList.replace('btn-secondary', 'btn-info');
        }
    }


    // حذف ملک (بدون تغییر در منطق اصلی)
    window.deleteProperty = function(propertyKey) { // Make globally accessible
        if (!confirm('آیا از حذف این ملک و تمام عکس‌های آن اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;

        const cardElement = document.getElementById(`card-${propertyKey}`);
        const cardSpinner = cardElement ? cardElement.querySelector('.card-spinner-overlay') : null;
        if (cardSpinner) cardSpinner.classList.remove('hidden');

        const propertyData = allPropertiesData.find(p => p.key === propertyKey);
        const imageURLsToDelete = (propertyData?.images && Array.isArray(propertyData.images)) ? [...propertyData.images] : [];

        database.ref('properties/' + propertyKey).remove()
            .then(() => {
                console.log(`Property ${propertyKey} deleted from database.`);
                if (imageURLsToDelete.length > 0) {
                    const deletePromises = imageURLsToDelete.map(imageUrl => {
                        if (imageUrl && (imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('gs://'))) {
                            const imageRef = storage.refFromURL(imageUrl);
                            return imageRef.delete().catch(error => {
                                console.error(`Error deleting image ${imageUrl}:`, error.code);
                                if (error.code !== 'storage/object-not-found') throw error; // Re-throw unexpected errors
                            });
                        } return Promise.resolve(); // Skip invalid URLs
                    });                    return Promise.all(deletePromises);
                } return Promise.resolve();
            })
            .then(() => {
                console.log("Associated images deleted or skipped.");
                // UI updates automatically via listener
                 if (cardSpinner) cardSpinner.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error during deletion process:', error);
                alert('خطا در حذف ملک یا عکس‌های آن: ' + error.message);
                 if (cardSpinner) cardSpinner.classList.add('hidden');
            });
    }

    // نمایش تصویر در اندازه کامل (بدون تغییر)
    window.showFullImage = function(imageUrl) { // Make globally accessible
        if (fullscreenImage && imageFullscreenOverlay) {
            fullscreenImage.src = imageUrl;
            imageFullscreenOverlay.style.display = 'flex';        }
    }

    // بستن تصویر تمام صفحه (بدون تغییر)
    function closeFullscreenImage() {
        if (imageFullscreenOverlay) {
            imageFullscreenOverlay.style.display = 'none';
            if(fullscreenImage) fullscreenImage.src = '';
        }
    }

    // پشتیبان‌گیری از داده‌ها (بدون تغییر)
    function backupData() {
        if (allPropertiesData.length === 0) { alert('هیچ داده‌ای برای پشتیبان‌گیری وجود ندارد.'); return; }
        try {
            const dataToBackup = JSON.parse(JSON.stringify(allPropertiesData));
            // dataToBackup.forEach(item => delete item.key); // Optional: remove key
            const dataStr = JSON.stringify(dataToBackup, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `properties-backup-${new Date().toISOString().slice(0,10)}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            document.body.appendChild(linkElement); linkElement.click(); document.body.removeChild(linkElement);
            console.log("Backup successful.");
        } catch (error) { console.error("Error during backup:", error); alert("خطا در ایجاد فایل پشتیبان: " + error.message); }
    }

    // بازیابی داده‌ها (بدون تغییر)
    function restoreData() {
        if (!restoreFile.files || restoreFile.files.length === 0) { alert('لطفاً یک فایل پشتیبان (.json) انتخاب کنید.'); return; }
        const file = restoreFile.files[0];
        if (!file.name.endsWith('.json')) { alert('فایل انتخاب شده باید با فرمت .json باشد.'); return; }
        const reader = new FileReader();
        reader.onload = function(e) {
            showOverlay(processingOverlay);
            try {
                const propertiesToRestore = JSON.parse(e.target.result);
                if (!Array.isArray(propertiesToRestore)) throw new Error('فرمت فایل JSON نامعتبر است.');
                if (propertiesToRestore.length === 0) { hideOverlay(processingOverlay); alert("فایل پشتیبان خالی است."); return; }
                if (!confirm(`${propertiesToRestore.length} ملک بازیابی شود؟ (به داده‌های موجود اضافه می‌شود)`)) { hideOverlay(processingOverlay); restoreFile.value = ''; return; }

                const restorePromises = propertiesToRestore.map(property => {
                    const { key, ...propertyData } = property;
                    if (!propertyData.dateTime) propertyData.dateTime = new Date().toISOString();
                    return database.ref('properties').push(propertyData);
                });
                Promise.all(restorePromises)
                    .then(() => { hideOverlay(processingOverlay); alert(`بازیابی ${propertiesToRestore.length} ملک موفق بود.`); restoreFile.value = ''; })
                    .catch(error => { hideOverlay(processingOverlay); console.error('Error restoring data:', error); alert('خطا در بازیابی: ' + error.message); });
            } catch (error) { hideOverlay(processingOverlay); console.error('Error parsing restore file:', error); alert('خطا در پردازش فایل: ' + error.message); restoreFile.value = ''; }
        };
        reader.onerror = () => { hideOverlay(processingOverlay); alert('خطا در خواندن فایل.'); restoreFile.value = ''; };
        reader.readAsText(file);
    }

    // حذف همه داده‌ها (فقط دیتابیس) (بدون تغییر)
    function clearAllData() {
        if (!confirm('تمام داده‌های املاک از دیتابیس حذف شود؟ (عکس‌ها حذف نمی‌شوند)')) return;
        showOverlay(processingOverlay);
        database.ref('properties').remove()
            .then(() => { hideOverlay(processingOverlay); alert('داده‌ها حذف شدند.'); allPropertiesData = []; applyFiltersAndDisplay(); console.log("Database cleared."); })
            .catch(error => { hideOverlay(processingOverlay); console.error('Error clearing database:', error); alert('خطا در حذف داده‌ها: ' + error.message); });
    }


    // --- Event Listeners (بدون بخش ورود) ---

    // Filter/Sort Controls
    if (filterTypeSelect) filterTypeSelect.addEventListener('change', function() { currentFilterType = this.value; applyFiltersAndDisplay(); });
    if (sortBySelect) sortBySelect.addEventListener('change', function() { currentSortBy = this.value; applyFiltersAndDisplay(); });
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (this.value === currentSearchTerm) applyFiltersAndDisplay();
            }, 300);
        });
    }

    // Backup/Restore/Clear Buttons
    if (backupBtn) backupBtn.addEventListener('click', backupData);
    if (restoreBtn) restoreBtn.addEventListener('click', restoreData);
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);

    // Close Fullscreen Image
    if (closeFullscreenBtn) closeFullscreenBtn.addEventListener('click', closeFullscreenImage);
    if (imageFullscreenOverlay) imageFullscreenOverlay.addEventListener('click', (e) => { if (e.target === imageFullscreenOverlay) closeFullscreenImage(); });

    // --- Initial Load ---
    console.log("Starting initial data load...");
    listenForProperties(); // Start loading data immediately

}); // End DOMContentLoaded