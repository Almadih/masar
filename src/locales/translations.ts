export type Locale = 'ar' | 'en';

export interface TranslationDictionary {
  common: {
    appName: string;
    appNameAr: string;
    appSubtitle: string;
    loading: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    confirm: string;
    search: string;
    filter: string;
    view: string;
    anonymous: string;
    public: string;
    private: string;
    km: string;
    photos: string;
    souls: string;
    routes: string;
    statusApproved: string;
    statusPending: string;
    statusFlagged: string;
    language: string;
    arabic: string;
    english: string;
    bookmark: string;
    bookmarked: string;
    removeBookmark: string;
    you: string;
    activeRoutes: string;
  };
  navbar: {
    explore: string;
    map: string;
    impact: string;
    impactArchive: string;
    shareJourney: string;
    signIn: string;
    adminDashboard: string;
    admin: string;
    signOut: string;
    moderationTag: string;
    returnToArchive: string;
  };
  explorer: {
    searchPlaceholder: string;
    allCorridors: string;
    northernCorridor: string;
    easternCorridor: string;
    southernCorridor: string;
    corridorFilterPrefix: string;
    showingJourneys: string;
    noJourneysTitle: string;
    noJourneysDesc: string;
    resetFilters: string;
    sortBy: string;
    sortRecent: string;
    sortDistance: string;
    sortPhotos: string;
    cardDistance: string;
    cardWaypoints: string;
    cardFamily: string;
    viewPath: string;
    privateBadge: string;
    publicBadge: string;
    filterAll: string;
    filterMy: string;
    filterBookmarks: string;
    clearSearch: string;
    noBookmarksTitle: string;
    noBookmarksDesc: string;
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    heroExploreMap: string;
    tabCommunity: string;
    tabMy: string;
    tabBookmarks: string;
    searchMyPlaceholder: string;
    searchBookmarksPlaceholder: string;
    allCategories: string;
    noMyJourneysTitle: string;
    noMyJourneysDesc: string;
    firstJourneyPrompt: string;
    routesCount: string;
    activeRoutesCount: string;
    selectRouteTip: string;
  };
  journeyDetail: {
    backToExplore: string;
    backToJourneys: string;
    familyMembers: string;
    totalDistance: string;
    corridorRoute: string;
    authorPrefix: string;
    startDate: string;
    endDate: string;
    routeTimeline: string;
    milestonePhoto: string;
    milestoneStep: string;
    exifDetected: string;
    locationPending: string;
    coordinates: string;
    shareStory: string;
    shareOnX: string;
    shareOnWhatsApp: string;
    shareOnFacebook: string;
    copyLink: string;
    linkCopied: string;
    shareCopied: string;
    viewOnMap: string;
    noPhotosYet: string;
    privateNotice: string;
    editJourney: string;
    prev: string;
    next: string;
    bookmark: string;
    bookmarked: string;
    jumpToWaypoint: string;
    keyboardNavTip: string;
    totalPath: string;
    travelingCount: string;
    startedAt: string;
    arrivedAt: string;
    milestoneScrubber: string;
    milestoneCountOf: string;
    milestoneScrubTip: string;
    milestoneNumber: string;
    noCaption: string;
    personalFieldNote: string;
    noPhotosForJourney: string;
    chronologicalTimeline: string;
    tapMilestoneTip: string;
    milestonePhotoFallback: string;
    expandPhoto: string;
    savedNotice: string;
    saveNotice: string;
    saveJourneyTitle: string;
    removeSavedTitle: string;
    shareStoryMenu: string;
    privateViewAlert: string;
    privateViewDesc: string;
    shareTextPrefix: string;
    photosInMilestone: string;
    photoOfMilestone: string;
    nextPhoto: string;
    prevPhoto: string;
    galleryThumbnails: string;
  };
  map: {
    streetView: string;
    satelliteView: string;
    topoView: string;
    resetView: string;
    viewFullJourney: string;
    legendTitle: string;
    legendStart: string;
    legendMilestone: string;
    legendDestination: string;
    pickLocationTip: string;
    selectedLocation: string;
    stepNumber: string;
    recenterSudan: string;
    fullscreen: string;
    exitFullscreen: string;
    multiPhotoBadge: string;
  };
  stats: {
    bannerTitle: string;
    bannerDescription: string;
    bannerSubtag: string;
    totalDistanceTitle: string;
    documentedRoutesTitle: string;
    photosPreservedTitle: string;
    familyMembersTitle: string;
    corridorsTitle: string;
    corridorNorthTitle: string;
    corridorNorthDesc: string;
    corridorEastTitle: string;
    corridorEastDesc: string;
    corridorWestTitle: string;
    corridorWestDesc: string;
    corridorSouthTitle: string;
    corridorSouthDesc: string;
  };
  uploader: {
    modalTitleCreate: string;
    modalTitleEdit: string;
    modalSubtitleCreate: string;
    modalSubtitleEdit: string;
    pageTitleCreate: string;
    pageTitleEdit: string;
    pageSubtitleCreate: string;
    pageSubtitleEdit: string;
    backToExplore: string;
    backToJourney: string;
    routePreviewTitle: string;
    routePreviewDesc: string;
    generalInfoTitle: string;
    generalInfoDesc: string;
    stepUp: string;
    stepDown: string;
    removePhoto: string;
    savingJourney: string;
    discardBtn: string;
    calculatedDistance: string;
    milestonesRecorded: string;
    titleLabel: string;
    titlePlaceholder: string;
    narrativeLabel: string;
    narrativePlaceholder: string;
    startOriginLabel: string;
    startOriginPlaceholder: string;
    destinationLabel: string;
    destinationPlaceholder: string;
    familyCountLabel: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    privacyPublicTitle: string;
    privacyPrivateTitle: string;
    privacyPublicDesc: string;
    privacyPrivateDesc: string;
    makePrivate: string;
    makePublic: string;
    dropzoneTitle: string;
    dropzoneDesc: string;
    parsingExif: string;
    milestonesTitle: string;
    autoExifDetected: string;
    locationMissing: string;
    locationNameLabel: string;
    locationNamePlaceholder: string;
    mapPickerBtn: string;
    timestampLabel: string;
    captionPlaceholder: string;
    photosCount: string;
    publishBtn: string;
    saveChangesBtn: string;
    alertTitleRequired: string;
    alertPhotoRequired: string;
    defaultAuthor: string;
    defaultSummary: string;
    defaultStart: string;
    defaultDest: string;
    defaultTags: string;
    previewTitle: string;
    previewVoyager: string;
    previewStart: string;
    previewDest: string;
    locationPending: string;
    addPhotosToPoint: string;
    photosAtPoint: string;
    setAsPointCover: string;
    removePointImage: string;
    addWaypointBtn: string;
    deleteWaypointConfirmTitle: string;
    deleteWaypointConfirmDesc: string;
    waypointTitleLabel: string;
    waypointTitlePlaceholder: string;
    waypointDescPlaceholder: string;
    noPhotosInWaypoint: string;
  };
  locationPicker: {
    modalTitle: string;
    modalSubtitle: string;
    presetLabel: string;
    presetDefault: string;
    locationNameLabel: string;
    locationNamePlaceholder: string;
    geocoding: string;
    latitudeLabel: string;
    longitudeLabel: string;
    dateLabel: string;
    presetApr15: string;
    presetMay: string;
    presetNow: string;
    confirmBtn: string;
    defaultCoordinateName: string;
    searchPlaceholder: string;
    searching: string;
    noResultsFound: string;
    verifiedHub: string;
    clearSearch: string;
  };
  auth: {
    modalTitle: string;
    modalSubtitle: string;
    googleBtnLabel: string;
    googleBtn: string;
    orGuest: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    guestBtn: string;
    creatingSession: string;
    privacyNotice: string;
    defaultGuestName: string;
  };
  admin: {
    moderatorCenter: string;
    pageTitle: string;
    pageSubtitle: string;
    kpiTotalJourneys: string;
    kpiPhotosRecorded: string;
    kpiPublicJourneys: string;
    kpiHiddenFromFeed: string;
    kpiPendingReview: string;
    kpiAwaitingApproval: string;
    kpiFlaggedJourneys: string;
    kpiRequiresAction: string;
    searchPlaceholder: string;
    filterStatus: string;
    filterAllStatus: string;
    filterApproved: string;
    filterPending: string;
    filterFlagged: string;
    filterAllVisibility: string;
    filterPublic: string;
    filterHidden: string;
    tableColJourney: string;
    tableColAuthor: string;
    tableColRoute: string;
    tableColPhotos: string;
    tableColStatus: string;
    tableColVisibility: string;
    tableColActions: string;
    noMatches: string;
    actionApprove: string;
    actionFlag: string;
    actionView: string;
    actionHide: string;
    actionShow: string;
    actionDelete: string;
    deleteConfirm: string;
  };
  notifications: {
    journeySaved: string;
    journeySavedDesc: string;
    journeyDeleted: string;
    visibilityPublic: string;
    visibilityPrivate: string;
    statusApproved: string;
    statusFlagged: string;
    linkCopied: string;
    linkCopiedDesc: string;
    bookmarkAdded: string;
    bookmarkRemoved: string;
    errorTitle: string;
    deleteJourneyConfirmTitle: string;
    deleteJourneyConfirmDesc: string;
    deletePhotoConfirmTitle: string;
    deletePhotoConfirmDesc: string;
    discardConfirmTitle: string;
    discardConfirmDesc: string;
    uploadProcessing: string;
    uploadComplete: string;
  };
  notFound: {
    title: string;
    description: string;
    returnHome: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  ar: {
    common: {
      appName: 'مسار',
      appNameAr: 'MASAR',
      appSubtitle: 'أرشيف النزوح الإنساني والذاكرة المصورة',
      loading: 'جاري التحميل...',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      confirm: 'تأكيد',
      search: 'بحث',
      filter: 'تصفية',
      view: 'معاينة',
      anonymous: 'مسافر مجهول',
      public: 'عام',
      private: 'خاص',
      km: 'كم',
      photos: 'صور',
      souls: 'أرواح',
      routes: 'مسارات',
      statusApproved: 'معتمد',
      statusPending: 'قيد المراجعة',
      statusFlagged: 'مُبلّغ عنه',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'English',
      bookmark: 'حفظ في المفضلة',
      bookmarked: 'محفوظ',
      removeBookmark: 'إزالة من المفضلة',
      you: 'أنت',
      activeRoutes: 'المسارات النشطة',
    },
    navbar: {
      explore: 'استكشاف المسارات',
      map: 'الخريطة التفاعلية',
      impact: 'الأثر الإنساني',
      impactArchive: 'أرشيف الأثر',
      shareJourney: 'وثّق مسارك',
      signIn: 'تسجيل الدخول',
      adminDashboard: 'لوحة الإشراف',
      admin: 'الإدارة',
      signOut: 'تسجيل الخروج',
      moderationTag: 'مشرف الأرشيف',
      returnToArchive: 'العودة إلى الأرشيف',
    },
    explorer: {
      searchPlaceholder: 'البحث عن مسار، مدينة، كاتب، أو وسم...',
      allCorridors: 'جميع الممرات',
      northernCorridor: 'الممر الشمالي (مصر)',
      easternCorridor: 'الممر الشرقي (البحر الأحمر)',
      southernCorridor: 'الممر الجنوبي والداخلي',
      corridorFilterPrefix: 'الممر:',
      showingJourneys: 'عرض {count} مسار موثق',
      noJourneysTitle: 'لم نجد مسارات تطابق بحثك',
      noJourneysDesc: 'جرب البحث بكلمات أخرى أو قم بإعادة ضبط تصفيات الممرات لاستكشاف القصص.',
      resetFilters: 'إعادة ضبط التصفية',
      sortBy: 'ترتيب حسب:',
      sortRecent: 'الأحدث',
      sortDistance: 'الأطول مسافة',
      sortPhotos: 'الأكثر صوراً',
      cardDistance: 'المسافة المقطوعة',
      cardWaypoints: 'محطات مصورة',
      cardFamily: 'أفراد الأسرة',
      viewPath: 'استعراض المسار والقصة',
      privateBadge: 'مسار خاص',
      publicBadge: 'مسار عام',
      filterAll: 'جميع المسارات',
      filterMy: 'قصصي ومساراتي',
      filterBookmarks: 'المحفوظات',
      clearSearch: 'مسح البحث',
      noBookmarksTitle: 'لا توجد مسارات محفوظة',
      noBookmarksDesc: 'يمكنك حفظ المسارات التي تهمك للرجوع إليها لاحقاً بالضغط على أيقونة الإشارة المرجعية.',
      heroBadge: 'توثيق الذاكرة الحية • Preserving Living Memories',
      heroTitle: 'قصص الصمود، والنزوح، والأمل',
      heroDesc: 'كل صورة جغرافية موثقة تحفظ لحظة فارقة في مسار رحلات الأسر السودانية أثناء النزوح. استكشف أرشيف المجتمع أو وثّق مسار رحلتك وقصتك.',
      heroExploreMap: 'استكشاف الخريطة الجغرافية',
      tabCommunity: 'قصص المجتمع',
      tabMy: 'مساراتي الموثقة',
      tabBookmarks: 'المسارات المحفوظة',
      searchMyPlaceholder: 'ابحث في مساراتك الخاصة...',
      searchBookmarksPlaceholder: 'ابحث في المسارات المحفوظة...',
      allCategories: 'جميع الفئات',
      noMyJourneysTitle: 'لم تقم بتوثيق أي مسار بعد',
      noMyJourneysDesc: 'ابدأ بتوثيق مسار رحلتك، ومحطاتها، والذكريات العائلية باستخدام التتبع الجغرافي التفاعلي.',
      firstJourneyPrompt: 'كن أول من يوثّق مسار نزوح ويخلّد تاريخ المجتمع.',
      routesCount: 'المسارات ({count})',
      activeRoutesCount: 'المسارات النشطة ({count})',
      selectRouteTip: 'اختر مساراً لاستعراض محطاته المصورة.',
    },
    journeyDetail: {
      backToExplore: 'العودة إلى استكشاف المسارات',
      backToJourneys: 'جميع المسارات',
      familyMembers: 'أفراد الأسرة المسافرين',
      totalDistance: 'إجمالي المسافة المقطوعة',
      corridorRoute: 'خط السير الموثق',
      authorPrefix: 'بواسطة',
      startDate: 'تاريخ الانطلاق',
      endDate: 'تاريخ الوصول',
      routeTimeline: 'الخط الزمني للمحطات المصورة',
      milestonePhoto: 'محطة مصورة',
      milestoneStep: 'المحطة {step}',
      exifDetected: 'إحداثيات وتاريخ تلقائي (EXIF)',
      locationPending: 'موقع غير محدد',
      coordinates: 'الإحداثيات',
      shareStory: 'مشاركة القصة',
      shareOnX: 'نشر على X (تويتر)',
      shareOnWhatsApp: 'مشاركة عبر واتساب',
      shareOnFacebook: 'مشاركة على فيسبوك',
      copyLink: 'نسخ رابط المسار',
      linkCopied: 'تم نسخ الرابط بنجاح!',
      shareCopied: 'تم نسخ الرابط!',
      viewOnMap: 'عرض على الخريطة',
      noPhotosYet: 'لا توجد صور مضافة لهذا المسار حتى الآن.',
      privateNotice: 'هذا المسار خاص وظاهر لك فقط كصاحب القصة أو لمشرفي المنصة.',
      editJourney: 'تعديل بيانات المسار',
      prev: 'السابق',
      next: 'التالي',
      bookmark: 'حفظ المسار',
      bookmarked: 'مسار محفوظ',
      jumpToWaypoint: 'الانتقال إلى هذه المحطة',
      keyboardNavTip: 'استخدم الأسهم يميناً ويساراً للتنقل بين المحطات',
      totalPath: 'إجمالي المسار',
      travelingCount: '{count} أفراد مسافرين',
      startedAt: 'انطلقت في {date}',
      arrivedAt: 'وصلت في {date}',
      milestoneScrubber: 'مستعرض المحطات التفاعلي',
      milestoneCountOf: 'المحطة {current} من {total}',
      milestoneScrubTip: 'استخدم الأسهم ◀ ▶ للتنقل',
      milestoneNumber: 'المحطة رقم #{step}',
      noCaption: 'لا يوجد تعليق مضاف.',
      personalFieldNote: 'ملاحظة ميدانية شخصية:',
      noPhotosForJourney: 'لا توجد صور محطات موثقة لهذا المسار بعد.',
      chronologicalTimeline: 'التسلسل الزمني للمسار ({count})',
      tapMilestoneTip: 'انقر على المحطة لعرضها على الخريطة',
      milestonePhotoFallback: 'صورة المحطة',
      expandPhoto: 'تكبير الصورة',
      savedNotice: 'محفوظ',
      saveNotice: 'حفظ',
      saveJourneyTitle: 'حفظ المسار',
      removeSavedTitle: 'إزالة من المحفوظات',
      shareStoryMenu: 'مشاركة هذه القصة',
      privateViewAlert: 'عرض خاص / غير معتمد:',
      privateViewDesc: 'هذا المسار مخفي عن المجتمع والجمهور، ولا يمكن الوصول إليه إلا من خلالك أو من قبل إدارة المنصة.',
      shareTextPrefix: '{title} - مسار رحلة نزوح في السودان ({start} ➔ {dest})',
      photosInMilestone: '{count} صور',
      photoOfMilestone: 'صورة {current} من {total}',
      nextPhoto: 'الصورة التالية',
      prevPhoto: 'الصورة السابقة',
      galleryThumbnails: 'معرض صور المحطة',
    },
    map: {
      streetView: 'خريطة الشوارع',
      satelliteView: 'الأقمار الصناعية',
      topoView: 'خريطة التضاريس',
      resetView: 'إعادة ضبط الخريطة',
      viewFullJourney: 'عرض المسار كاملاً',
      legendTitle: 'دليل الخريطة',
      legendStart: 'نقطة الانطلاق',
      legendMilestone: 'محطة في الطريق',
      legendDestination: 'نقطة الوصول',
      pickLocationTip: 'انقر في أي مكان على الخريطة لتحديد موقع الصورة بدقة',
      selectedLocation: 'الموقع المحدد',
      stepNumber: 'المحطة {number}',
      recenterSudan: 'إعادة ضبط العرض على السودان',
      fullscreen: 'عرض ملء الشاشة',
      exitFullscreen: 'الخروج من ملء الشاشة',
      multiPhotoBadge: '{count} صور',
    },
    stats: {
      bannerTitle: 'أرشيف النزوح والأثر الإنساني في السودان',
      bannerDescription: 'أدت الحرب في السودان إلى نزوح أكثر من 10 ملايين إنسان عبر حدود الولايات والدول المجاورة. تحول منصة مسار (MASAR) الذكريات المصورة إلى خريطة تفاعلية حية تخلّد الصمود والتكاتف الإنساني.',
      bannerSubtag: 'كل صورة تحمل ذكرى، وقصة، وحقيقة لا تُنسى.',
      totalDistanceTitle: 'إجمالي المسافات المقطوعة',
      documentedRoutesTitle: 'المسارات الموثقة',
      photosPreservedTitle: 'الصور المحفوظة جغرافياً',
      familyMembersTitle: 'أرواح مسجلة في الأرشيف',
      corridorsTitle: 'ممرات النزوح الرئيسية',
      corridorNorthTitle: 'الممر الشمالي (الحدود المصرية)',
      corridorNorthDesc: 'الخرطوم ➔ دنقلا ➔ وادي حلفا ➔ معبر أرقين / أشكال ➔ القاهرة',
      corridorEastTitle: 'الممر الشرقي (البحر الأحمر)',
      corridorEastDesc: 'الخرطوم ➔ ود مدني ➔ القضارف ➔ كسلا ➔ بورتسودان',
      corridorWestTitle: 'الممر الغربي والجنوبي (تشاد وجنوب السودان)',
      corridorWestDesc: 'دارفور / كوستي ➔ معبر أدري / الرنك ➔ تشاد وجنوب السودان',
      corridorSouthTitle: 'الممر الجنوبي والداخلي',
      corridorSouthDesc: 'الخرطوم ➔ سنار ➔ النيل الأبيض / الأزرق ➔ تشاد وجنوب السودان',
    },
    uploader: {
      modalTitleCreate: 'توثيق مسار نزوح جديد',
      modalSubtitleCreate: 'شارك ذكريات ومحطات رحلتك بالصور والتاريخ لحفظ الذاكرة الإنسانية للأجيال القادمة.',
      modalSubtitleEdit: 'قم بتحديث محطات القصة أو تعديل الصور والمواقع الجغرافية.',
      modalTitleEdit: 'تعديل مسار النزوح',
      pageTitleCreate: 'إنشاء وتوثيق مسار رحلة',
      pageTitleEdit: 'تعديل مسار الرحلة والذكريات',
      pageSubtitleCreate: 'سجل محطات طريقك بالصور والتواريخ لتخليد الذاكرة الحية للصمود الإنساني.',
      pageSubtitleEdit: 'قم بتحديث نقاط المسار وتفاصيل المحطات والقصة.',
      backToExplore: 'إلغاء والعودة للمسارات',
      backToJourney: 'إلغاء والعودة لصفحة المسار',
      routePreviewTitle: 'معاينة المسار المباشر',
      routePreviewDesc: 'خريطة تفاعلية تعرض مسار الرحلة بناءً على الصور والمواقع المحددة.',
      generalInfoTitle: 'البيانات الأساسية للمسار',
      generalInfoDesc: 'عنوان الرحلة والقصة الإنسانية ونطاق الخصوصية.',
      stepUp: 'تقديم للأعلى',
      stepDown: 'تأخير للأسفل',
      removePhoto: 'حذف المحطة',
      savingJourney: 'جاري حفظ المسار والصور...',
      discardBtn: 'إلغاء',
      calculatedDistance: 'إجمالي المسافة المحسوبة:',
      milestonesRecorded: 'محطات مصورة موثقة:',
      titleLabel: 'عنوان المسار أو الرحلة *',
      titlePlaceholder: 'مثال: طريق الخروج من الخرطوم إلى بورتسودان',
      narrativeLabel: 'القصة أو الملخص الإنساني للرحلة',
      narrativePlaceholder: 'شاركنا تفاصيل الطريق، المعاناة، الصمود، واللحظات التي لا تُنسى...',
      startOriginLabel: 'نقطة الانطلاق *',
      startOriginPlaceholder: 'مثال: الخرطوم بحري',
      destinationLabel: 'الوجهة أو بر الأمان *',
      destinationPlaceholder: 'مثال: بورتسودان أو القاهرة',
      familyCountLabel: 'عدد أفراد الأسرة المسافرين:',
      tagsLabel: 'الوسوم (مفصولة بفواصل):',
      tagsPlaceholder: 'نزوح، ملجأ، صمود، الخرطوم، بورتسودان',
      privacyPublicTitle: 'مسار عام للجميع',
      privacyPrivateTitle: 'مسار خاص',
      privacyPublicDesc: 'يظهر في خريطة الأرشيف المجتمعي ويمكن للجميع الاطلاع عليه.',
      privacyPrivateDesc: 'يظهر لك فقط كصاحب القصة ولمشرفي المنصة.',
      makePrivate: 'جعل المسار خاصاً',
      makePublic: 'جعل المسار عاماً',
      dropzoneTitle: 'اسحب الصور وأفلتها هنا، أو اضغط للاختيار',
      dropzoneDesc: 'تدعم المنصة ملفات JPG, PNG, WEBP, HEIC. نقوم باستخراج الموقع والتاريخ تلقائياً إن وُجدت.',
      parsingExif: 'جاري استخراج البيانات الجغرافية من الصور...',
      milestonesTitle: 'محطات الرحلة المصورة',
      autoExifDetected: 'تم التقاط الموقع والتاريخ تلقائياً من الصورة (EXIF)',
      locationMissing: 'الموقع الجغرافي غير مسجل بالصورة — يرجى التحديد على الخريطة',
      locationNameLabel: 'اسم المحطة أو المنطقة:',
      locationNamePlaceholder: 'مثال: كبري حنتوب، ود مدني',
      mapPickerBtn: 'تحديد الموقع',
      timestampLabel: 'تاريخ ووقت المحطة:',
      captionPlaceholder: 'اكتب تفاصيل أو ذكرى هذه المحطة...',
      photosCount: '{count} صور مضافة',
      publishBtn: 'حفظ ونشر المسار في الأرشيف',
      saveChangesBtn: 'حفظ التعديلات في الأرشيف',
      alertTitleRequired: 'يرجى إدخال عنوان للمسار قبل الحفظ.',
      alertPhotoRequired: 'يرجى رفع صورة واحدة على الأقل لتوثيق مسار الرحلة.',
      defaultAuthor: 'مسافر مجهول',
      defaultSummary: 'قصة نزوح وصمود إنساني.',
      defaultStart: 'السودان',
      defaultDest: 'بر الأمان',
      defaultTags: 'نزوح، ملجأ، ذكريات',
      previewTitle: 'معاينة المسار',
      previewVoyager: 'مسافر',
      previewStart: 'البداية',
      previewDest: 'الوجهة',
      locationPending: 'موقع قيد التحديد...',
      addPhotosToPoint: 'إضافة صور لهذه النقطة',
      photosAtPoint: '{count} صور في هذه النقطة',
      setAsPointCover: 'تعيين كصورة رئيسية',
      removePointImage: 'حذف الصورة',
      addWaypointBtn: 'إضافة محطة',
      deleteWaypointConfirmTitle: 'حذف المحطة',
      deleteWaypointConfirmDesc: 'هل أنت متأكد من رغبتك في حذف هذه المحطة وكافة الصور المرتبطة بها؟',
      waypointTitleLabel: 'عنوان المحطة (اختياري)',
      waypointTitlePlaceholder: 'مثال: مغادرة الحي تحت القصف',
      waypointDescPlaceholder: 'اكتب تفاصيل أو ملاحظات عن هذه المحطة...',
      noPhotosInWaypoint: 'لم تتم إضافة صور لهذه المحطة بعد',
    },
    locationPicker: {
      modalTitle: 'تحديد موقع وتاريخ المحطة',
      modalSubtitle: 'انقر على الخريطة لتحديد الإحداثيات الدقيقة أو اختر من المحطات المقترحة.',
      presetLabel: 'محطات نزوح شائعة وسريعة:',
      presetDefault: 'اختر موقعاً مقترحاً...',
      locationNameLabel: 'اسم الموقع أو المدينة:',
      locationNamePlaceholder: 'مثال: محطة شندي، ولاية نهر النيل',
      geocoding: 'جاري تحديد اسم المنطقة...',
      latitudeLabel: 'خط العرض:',
      longitudeLabel: 'خط الطول:',
      dateLabel: 'تاريخ ووقت الالتقاط:',
      presetApr15: '⚡ 15 أبريل 2023 (بداية الأحداث)',
      presetMay: '🚚 مايو 2023',
      presetNow: '🕒 الوقت الحالي',
      confirmBtn: 'تأكيد الموقع والوقت',
      defaultCoordinateName: 'موقع ({lat}, {lng})',
      searchPlaceholder: 'ابحث عن مدينة، معبر، حي، أو معلم...',
      searching: 'جاري البحث في الخريطة...',
      noResultsFound: 'لم يتم العثور على نتائج، انقر على الخريطة مباشرة',
      verifiedHub: 'محطة موثقة',
      clearSearch: 'مسح البحث',
    },
    auth: {
      modalTitle: 'توثيق وحفظ الذاكرة',
      modalSubtitle: 'سجل دخولك لتخليد قصتك المصورة ومسار نزوحك ولتكون جزءاً من الذاكرة الإنسانية للشعب السوداني.',
      googleBtnLabel: 'تسجيل الدخول عبر Google',
      googleBtn: 'المتابعة بحساب Google',
      orGuest: 'أو جلسة مسافر مجهول (Guest)',
      displayNameLabel: 'الاسم المعروض (اختياري):',
      displayNamePlaceholder: 'مثال: صوت سوداني، عائلة أحمد',
      guestBtn: 'المتابعة كمسافر مجهول (جلسة زائر)',
      creatingSession: 'جاري إنشاء الجلسة...',
      privacyNotice: 'يتم التعامل مع كافة البيانات والشهادات بخصوصية واحترام كامل لكرامة أصحابها.',
      defaultGuestName: 'مسافر سوداني',
    },
    admin: {
      moderatorCenter: 'مركز التحكم الإشرافي',
      pageTitle: 'إدارة المحتوى ومراجعة مسارات مسار',
      pageSubtitle: 'مراجعة واعتماد أو حجب المسارات الموثقة لحفظ الدقة والكرامة الإنسانية في الأرشيف.',
      kpiTotalJourneys: 'إجمالي المسارات',
      kpiPhotosRecorded: 'صورة ومحطة موثقة',
      kpiPublicJourneys: 'المسارات العامة',
      kpiHiddenFromFeed: 'مسارات مخفية عن النشر العام',
      kpiPendingReview: 'قيد المراجعة',
      kpiAwaitingApproval: 'بانتظار موافقة المشرفين',
      kpiFlaggedJourneys: 'المسارات المبلّغ عنها',
      kpiRequiresAction: 'تتطلب تدخلاً إشرافياً',
      searchPlaceholder: 'البحث بالعنوان، الكاتب، أو الموقع...',
      filterStatus: 'الحالة:',
      filterAllStatus: 'جميع الحالات',
      filterApproved: 'المعتمدة فقط',
      filterPending: 'قيد المراجعة',
      filterFlagged: 'المُبلّغ عنها',
      filterAllVisibility: 'جميع مستويات الظهور',
      filterPublic: 'العامة فقط',
      filterHidden: 'المخفية فقط',
      tableColJourney: 'المسار',
      tableColAuthor: 'الكاتب',
      tableColRoute: 'خط السير',
      tableColPhotos: 'الصور',
      tableColStatus: 'الحالة',
      tableColVisibility: 'الظهور',
      tableColActions: 'الإجراءات',
      noMatches: 'لا توجد مسارات تطابق معايير التصفية المحددة.',
      actionApprove: 'اعتماد',
      actionFlag: 'إبلاغ',
      actionView: 'معاينة',
      actionHide: 'إخفاء',
      actionShow: 'إظهار',
      actionDelete: 'حذف',
      deleteConfirm: 'هل أنت متأكد من رغبتك في حذف مسار "{title}" نهائياً؟',
    },
    notifications: {
      journeySaved: 'تم حفظ المسار بنجاح!',
      journeySavedDesc: 'تم توثيق رحلتك وتحديث الأرشيف بنجاح.',
      journeyDeleted: 'تم حذف المسار بنجاح.',
      visibilityPublic: 'تم تغيير مستوى الظهور إلى عام.',
      visibilityPrivate: 'تم جعل المسار خاصاً.',
      statusApproved: 'تم اعتماد ونشر المسار في الأرشيف.',
      statusFlagged: 'تم الإبلاغ عن المسار وتغيير حالته.',
      linkCopied: 'تم نسخ الرابط!',
      linkCopiedDesc: 'تم نسخ رابط المسار إلى الحافظة بنجاح.',
      bookmarkAdded: 'تمت إضافة المسار إلى المحفوظات.',
      bookmarkRemoved: 'تمت إزالة المسار من المحفوظات.',
      errorTitle: 'حدث خطأ',
      deleteJourneyConfirmTitle: 'تأكيد حذف المسار',
      deleteJourneyConfirmDesc: 'هل أنت متأكد من رغبتك في حذف هذا المسار نهائياً؟ لا يمكن التراجع عن هذه الخطوة.',
      deletePhotoConfirmTitle: 'تأكيد إزالة المحطة',
      deletePhotoConfirmDesc: 'هل أنت متأكد من حذف هذه المحطة المصورة من المسار؟',
      discardConfirmTitle: 'تأكيد إلغاء التغييرات',
      discardConfirmDesc: 'هل أنت متأكد من مغادرة هذه الصفحة وإلغاء التغييرات غير المحفوظة؟',
      uploadProcessing: 'جاري معالجة واستخراج بيانات {count} صور...',
      uploadComplete: 'تمت معالجة الصور وإضافتها بنجاح!',
    },
    notFound: {
      title: '404 - الصفحة غير موجودة',
      description: 'تعذر العثور على المسار أو الصفحة المطلوبة في أرشيف مسار.',
      returnHome: 'العودة إلى الصفحة الرئيسية',
    },
  },
  en: {
    common: {
      appName: 'MASAR',
      appNameAr: 'مسار',
      appSubtitle: 'Human Displacement & Visual Memory Archive',
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      view: 'View',
      anonymous: 'Anonymous Voyager',
      public: 'Public',
      private: 'Private',
      km: 'km',
      photos: 'photos',
      souls: 'souls',
      routes: 'routes',
      statusApproved: 'Approved',
      statusPending: 'Pending Review',
      statusFlagged: 'Flagged',
      language: 'Language',
      arabic: 'العربية',
      english: 'English',
      bookmark: 'Bookmark Journey',
      bookmarked: 'Bookmarked',
      removeBookmark: 'Remove Bookmark',
      you: 'You',
      activeRoutes: 'Active Routes',
    },
    navbar: {
      explore: 'Explore Paths',
      map: 'Interactive Map',
      impact: 'Human Impact',
      impactArchive: 'Archive Impact',
      shareJourney: 'Document Path',
      signIn: 'Sign In',
      adminDashboard: 'Admin Dashboard',
      admin: 'Admin',
      signOut: 'Sign Out',
      moderationTag: 'Archive Moderator',
      returnToArchive: 'Return to Archive',
    },
    explorer: {
      searchPlaceholder: 'Search by journey title, city, author, or tag...',
      allCorridors: 'All Corridors',
      northernCorridor: 'Northern Corridor (Egypt)',
      easternCorridor: 'Eastern Corridor (Red Sea)',
      southernCorridor: 'Southern & Domestic Corridors',
      corridorFilterPrefix: 'Corridor:',
      showingJourneys: 'Showing {count} documented journeys',
      noJourneysTitle: 'No journeys matched your search',
      noJourneysDesc: 'Try adjusting your search terms or reset the corridor filters to discover more paths.',
      resetFilters: 'Reset Filters',
      sortBy: 'Sort by:',
      sortRecent: 'Most Recent',
      sortDistance: 'Longest Distance',
      sortPhotos: 'Most Photos',
      cardDistance: 'Distance Traveled',
      cardWaypoints: 'Photo Milestones',
      cardFamily: 'Family Members',
      viewPath: 'View Path & Story',
      privateBadge: 'Private Journey',
      publicBadge: 'Public Journey',
      filterAll: 'All Journeys',
      filterMy: 'My Stories',
      filterBookmarks: 'Bookmarks',
      clearSearch: 'Clear search',
      noBookmarksTitle: 'No bookmarked journeys',
      noBookmarksDesc: 'Save stories you want to revisit later by clicking the bookmark icon on any journey card.',
      heroBadge: 'Preserving Living Memories • توثيق الذاكرة الحية',
      heroTitle: 'Stories of Resilience, Migration, and Hope',
      heroDesc: 'Every geotagged photograph preserves a moment along the paths of Sudanese families navigating displacement. Explore the community archive or share your personal journey.',
      heroExploreMap: 'Explore Geographic Map',
      tabCommunity: 'Community Stories',
      tabMy: 'My Journeys',
      tabBookmarks: 'Bookmarked',
      searchMyPlaceholder: 'Search within your journeys...',
      searchBookmarksPlaceholder: 'Search bookmarked journeys...',
      allCategories: 'All Categories',
      noMyJourneysTitle: "You haven't documented any journeys yet",
      noMyJourneysDesc: 'Start documenting your displacement path, milestones, and family memories with interactive GPS tracking.',
      firstJourneyPrompt: 'Be the first to archive a displacement path and preserve community history.',
      routesCount: 'Routes ({count})',
      activeRoutesCount: 'Active Routes ({count})',
      selectRouteTip: 'Select a route to view photo milestones.',
    },
    journeyDetail: {
      backToExplore: 'Back to Explore Paths',
      backToJourneys: 'All Journeys',
      familyMembers: 'Family Members Journeying',
      totalDistance: 'Total Distance Traveled',
      corridorRoute: 'Documented Route',
      authorPrefix: 'Documented by',
      startDate: 'Departure Date',
      endDate: 'Arrival Date',
      routeTimeline: 'Photo Milestone Timeline',
      milestonePhoto: 'Photo Milestone',
      milestoneStep: 'Step {step}',
      exifDetected: 'Auto-EXIF Location & Date Detected',
      locationPending: 'Location Pending',
      coordinates: 'Coordinates',
      shareStory: 'Share Story',
      shareOnX: 'Share on X (Twitter)',
      shareOnWhatsApp: 'Share on WhatsApp',
      shareOnFacebook: 'Share on Facebook',
      copyLink: 'Copy Journey Link',
      linkCopied: 'Journey link copied!',
      shareCopied: 'Link Copied!',
      viewOnMap: 'View on Map',
      noPhotosYet: 'No photos have been added to this journey yet.',
      privateNotice: 'This journey is private and only visible to you and platform administrators.',
      editJourney: 'Edit Journey Details',
      prev: 'Prev',
      next: 'Next',
      bookmark: 'Bookmark Journey',
      bookmarked: 'Bookmarked',
      jumpToWaypoint: 'Jump to this milestone',
      keyboardNavTip: 'Use Left / Right arrow keys to step through waypoints',
      totalPath: 'total path',
      travelingCount: '{count} Traveling',
      startedAt: 'Started {date}',
      arrivedAt: 'Arrived {date}',
      milestoneScrubber: 'Interactive Milestone Scrubber',
      milestoneCountOf: 'Milestone {current} of {total}',
      milestoneScrubTip: 'Use ◀ ▶ arrow keys to scrub',
      milestoneNumber: 'Milestone #{step}',
      noCaption: 'No caption provided.',
      personalFieldNote: 'Personal Field Note:',
      noPhotosForJourney: 'No milestone photos available for this journey.',
      chronologicalTimeline: 'Chronological Path Timeline ({count})',
      tapMilestoneTip: 'Tap milestone to view on map',
      milestonePhotoFallback: 'Milestone photo',
      expandPhoto: 'Expand Full Photo',
      savedNotice: 'Saved',
      saveNotice: 'Bookmark',
      saveJourneyTitle: 'Bookmark journey',
      removeSavedTitle: 'Remove from saved',
      shareStoryMenu: 'Share this story',
      privateViewAlert: 'Private / Unapproved View:',
      privateViewDesc: 'This journey is hidden from public view or pending review. It is only accessible to you as the author or an administrator.',
      shareTextPrefix: '{title} - Sudan Displacement Journey ({start} ➔ {dest})',
      photosInMilestone: '{count} photos',
      photoOfMilestone: 'Photo {current} of {total}',
      nextPhoto: 'Next photo',
      prevPhoto: 'Previous photo',
      galleryThumbnails: 'Waypoint gallery',
    },
    map: {
      streetView: 'Street Map',
      satelliteView: 'Satellite',
      topoView: 'Topography',
      resetView: 'Reset Map View',
      viewFullJourney: 'View Full Journey',
      legendTitle: 'Map Legend',
      legendStart: 'Departure Point',
      legendMilestone: 'Waystation Milestone',
      legendDestination: 'Destination Point',
      pickLocationTip: 'Click anywhere on the map to set the photo location accurately',
      selectedLocation: 'Selected Location',
      stepNumber: 'Step {number}',
      recenterSudan: 'Recenter to Sudan',
      fullscreen: 'Full Screen Map',
      exitFullscreen: 'Exit Full Screen',
      multiPhotoBadge: '{count} photos',
    },
    stats: {
      bannerTitle: 'Human Impact & Displacement Archive',
      bannerDescription: 'The Sudan War displaced over 10 million people across state borders and international boundaries. MASAR (مسار) transforms personal photo memories into a living map of human endurance.',
      bannerSubtag: 'Every photo geotag carries a memory, a story, and a truth.',
      totalDistanceTitle: 'Total Distance Traveled',
      documentedRoutesTitle: 'Documented Journeys',
      photosPreservedTitle: 'Photos Preserved',
      familyMembersTitle: 'Souls in Archive',
      corridorsTitle: 'Major Displacement Corridors',
      corridorNorthTitle: 'Northern Corridor (Egypt Border)',
      corridorNorthDesc: 'Khartoum ➔ Dongola ➔ Wadi Halfa ➔ Argeen/Ashkeet ➔ Cairo',
      corridorEastTitle: 'Eastern Corridor (Red Sea)',
      corridorEastDesc: 'Khartoum ➔ Wad Madani ➔ Gedaref ➔ Kassala ➔ Port Sudan',
      corridorWestTitle: 'Western & Southern Corridor (Chad & South Sudan)',
      corridorWestDesc: 'Darfur / Kosti ➔ Adre Border / Renk ➔ Chad & South Sudan',
      corridorSouthTitle: 'Southern & Domestic Corridors',
      corridorSouthDesc: 'Khartoum ➔ Sennar ➔ White/Blue Nile ➔ Chad & South Sudan',
    },
    uploader: {
      modalTitleCreate: 'Document a New Displacement Path',
      modalSubtitleCreate: 'Preserve your family\'s journey with photos, dates, and waypoints to honor the memory and endurance of Sudanese people.',
      modalSubtitleEdit: 'Update milestone locations, modify photos, or edit journey details.',
      modalTitleEdit: 'Edit Displacement Path',
      pageTitleCreate: 'Document & Map a Journey',
      pageTitleEdit: 'Edit Journey & Milestones',
      pageSubtitleCreate: 'Record your path with photos and timestamps to preserve human resilience in the MASAR archive.',
      pageSubtitleEdit: 'Update waypoints, dates, and narrative details.',
      backToExplore: 'Cancel & Return to Paths',
      backToJourney: 'Cancel & Return to Journey',
      routePreviewTitle: 'Live Route Preview',
      routePreviewDesc: 'Interactive map dynamically visualizes your journey based on uploaded milestone photos.',
      generalInfoTitle: 'Journey Information',
      generalInfoDesc: 'Provide title, human story, and visibility preferences.',
      stepUp: 'Move Earlier',
      stepDown: 'Move Later',
      removePhoto: 'Remove Milestone',
      savingJourney: 'Saving journey & photo files...',
      discardBtn: 'Cancel',
      calculatedDistance: 'Calculated Distance:',
      milestonesRecorded: 'Milestones Recorded:',
      titleLabel: 'Journey Title *',
      titlePlaceholder: 'e.g. Route of Hope from Khartoum to Port Sudan',
      narrativeLabel: 'Human Story & Narrative Summary',
      narrativePlaceholder: 'Share the memories, challenges, mutual aid, and moments that defined your path...',
      startOriginLabel: 'Departure Origin *',
      startOriginPlaceholder: 'e.g. Khartoum North (Bahri)',
      destinationLabel: 'Safe Destination *',
      destinationPlaceholder: 'e.g. Port Sudan or Cairo',
      familyCountLabel: 'Number of Family Members Traveling:',
      tagsLabel: 'Tags (separated by comma):',
      tagsPlaceholder: 'Displacement, Refuge, Resilience, Khartoum, Port Sudan',
      privacyPublicTitle: 'Public Journey',
      privacyPrivateTitle: 'Private Journey',
      privacyPublicDesc: 'Visible to everyone in the public community archive and map.',
      privacyPrivateDesc: 'Only visible to you and archive moderators.',
      makePrivate: 'Make Private',
      makePublic: 'Make Public',
      dropzoneTitle: 'Upload Journey Photos',
      dropzoneDesc: 'Tap or drag photos to add. EXIF location & date tags will be automatically parsed!',
      parsingExif: 'Parsing EXIF metadata from uploaded images...',
      milestonesTitle: 'Path Milestone Steps ({count} photos)',
      autoExifDetected: 'Auto-EXIF Detected',
      locationMissing: 'Location Missing',
      locationNameLabel: 'Location Name:',
      locationNamePlaceholder: 'e.g. Wad Madani Checkpoint',
      mapPickerBtn: 'Map Picker',
      timestampLabel: 'Timestamp:',
      captionPlaceholder: 'Milestone caption (e.g. Waiting at the border checkpoint with fellow travelers...)',
      photosCount: '{count} photo milestone(s)',
      publishBtn: 'Publish Journey',
      saveChangesBtn: 'Save Changes',
      alertTitleRequired: 'Please provide a title for your journey.',
      alertPhotoRequired: 'Please upload at least one photo for your displacement path.',
      defaultAuthor: 'Anonymous Voyager',
      defaultSummary: 'A story of resilience and displacement.',
      defaultStart: 'Sudan',
      defaultDest: 'Safety',
      defaultTags: 'Displacement, Refuge, Memory',
      previewTitle: 'Route Preview',
      previewVoyager: 'Voyager',
      previewStart: 'Start',
      previewDest: 'Destination',
      locationPending: 'Location pending...',
      addPhotosToPoint: 'Add photos to this point',
      photosAtPoint: '{count} photos at this point',
      setAsPointCover: 'Set as cover',
      removePointImage: 'Remove image',
      addWaypointBtn: 'Add New Waypoint',
      deleteWaypointConfirmTitle: 'Delete Waypoint',
      deleteWaypointConfirmDesc: 'Are you sure you want to delete this waypoint and all of its photos?',
      waypointTitleLabel: 'Waypoint Title (Optional)',
      waypointTitlePlaceholder: 'e.g. Departure Under Shelling',
      waypointDescPlaceholder: 'Write details or field notes about this waypoint...',
      noPhotosInWaypoint: 'No photos added to this waypoint yet',
    },
    locationPicker: {
      modalTitle: 'Set Photo Location & Time',
      modalSubtitle: 'Click on the map or choose a preset to set where and when this photo was taken.',
      presetLabel: 'Quick Preset Location:',
      presetDefault: '-- Select Sudanese / Regional City --',
      locationNameLabel: 'Location Name / City:',
      locationNamePlaceholder: 'e.g. Wad Madani Checkpoint',
      geocoding: 'Finding location details...',
      latitudeLabel: 'Latitude:',
      longitudeLabel: 'Longitude:',
      dateLabel: 'Date & Time Taken:',
      presetApr15: '⚡ April 15, 2023',
      presetMay: '🚚 May 2023',
      presetNow: '🕒 Now',
      confirmBtn: 'Confirm Location & Time',
      defaultCoordinateName: 'Location ({lat}, {lng})',
      searchPlaceholder: 'Search city, town, border crossing, or landmark...',
      searching: 'Searching map...',
      noResultsFound: 'No locations found, click directly on the map',
      verifiedHub: 'Verified Point',
      clearSearch: 'Clear search',
    },
    auth: {
      modalTitle: 'Document & Preserve',
      modalSubtitle: 'Sign in to share your photo-displacement story, map your path, and honor the journeys of Sudanese people.',
      googleBtnLabel: 'Sign In with Google',
      googleBtn: 'Continue with Google',
      orGuest: 'OR ANONYMOUS GUEST',
      displayNameLabel: 'Display Name (Optional):',
      displayNamePlaceholder: 'e.g. Sudanese Voice, Ahmed\'s Family',
      guestBtn: 'Continue as Guest (Anonymous Session)',
      creatingSession: 'Creating Session...',
      privacyNotice: 'Your data is handled with privacy, respect, and dignity.',
      defaultGuestName: 'Sudanese Voyager',
    },
    admin: {
      moderatorCenter: 'Moderator Control Center',
      pageTitle: 'MASAR Moderation & Content Management',
      pageSubtitle: 'Review, approve, flag, or modify visibility for submitted Sudanese displacement paths to preserve archival integrity and dignity.',
      kpiTotalJourneys: 'Total Journeys',
      kpiPhotosRecorded: 'photo points recorded',
      kpiPublicJourneys: 'Public Journeys',
      kpiHiddenFromFeed: 'hidden from public feed',
      kpiPendingReview: 'Pending Review',
      kpiAwaitingApproval: 'Awaiting moderator approval',
      kpiFlaggedJourneys: 'Flagged Journeys',
      kpiRequiresAction: 'Requires admin action',
      searchPlaceholder: 'Search by title, author, or location...',
      filterStatus: 'Status:',
      filterAllStatus: 'All Statuses',
      filterApproved: 'Approved',
      filterPending: 'Pending',
      filterFlagged: 'Flagged',
      filterAllVisibility: 'All Visibility',
      filterPublic: 'Public',
      filterHidden: 'Hidden',
      tableColJourney: 'Journey',
      tableColAuthor: 'Author',
      tableColRoute: 'Route',
      tableColPhotos: 'Photos',
      tableColStatus: 'Status',
      tableColVisibility: 'Visibility',
      tableColActions: 'Actions',
      noMatches: 'No displacement journeys match the selected moderation filters.',
      actionApprove: 'Approve',
      actionFlag: 'Flag',
      actionView: 'View',
      actionHide: 'Hide',
      actionShow: 'Show',
      actionDelete: 'Delete',
      deleteConfirm: 'Are you sure you want to permanently delete journey "{title}"?',
    },
    notifications: {
      journeySaved: 'Journey saved successfully!',
      journeySavedDesc: 'Your path has been documented and updated in the archive.',
      journeyDeleted: 'Journey deleted successfully.',
      visibilityPublic: 'Journey visibility set to public.',
      visibilityPrivate: 'Journey is now private.',
      statusApproved: 'Journey approved and published in the archive.',
      statusFlagged: 'Journey flagged for review.',
      linkCopied: 'Link copied!',
      linkCopiedDesc: 'Journey link has been copied to your clipboard.',
      bookmarkAdded: 'Journey added to bookmarks.',
      bookmarkRemoved: 'Journey removed from bookmarks.',
      errorTitle: 'An error occurred',
      deleteJourneyConfirmTitle: 'Confirm Journey Deletion',
      deleteJourneyConfirmDesc: 'Are you sure you want to delete this journey? This action cannot be undone.',
      deletePhotoConfirmTitle: 'Remove Milestone Photo',
      deletePhotoConfirmDesc: 'Are you sure you want to remove this photo waypoint from the journey?',
      discardConfirmTitle: 'Discard Changes',
      discardConfirmDesc: 'Are you sure you want to leave this page? Any unsaved changes will be lost.',
      uploadProcessing: 'Processing and extracting metadata for {count} photos...',
      uploadComplete: 'Photos processed and added successfully!',
    },
    notFound: {
      title: '404 - Page Not Found',
      description: 'The requested resource or journey could not be located in the MASAR archive.',
      returnHome: 'Return to Home',
    },
  },
};
