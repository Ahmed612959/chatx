// قاموس إنجليزي طبي/تمريضي/صيدلي — بيانات ثابتة (مش محتاجة سيرفر ولا API)
// يُستخدم في صفحة English Pro كمرجع دائم للطالب يقدر يدوّر ويسمع فيه في أي وقت.
// المحتوى اتجمّع ونُظّم بالرجوع لمصطلحات OET/NCLEX/Nursing English المتداولة، وكل
// تعريف ومثال اتكتب من جديد بأسلوبنا (مش نسخ حرفي من أي مصدر). قاموس نامي تدريجيًا.
const MEDICAL_DICTIONARY = [
  {
    "word": "blood pressure",
    "ipa": "[blʌd ˈpreʃər] (بلَد بريشَر)",
    "meaning": "ضغط الدم",
    "category": "vitals",
    "exampleEn": "The nurse checks the patient's blood pressure every four hours.",
    "exampleAr": "الممرض/ة بيفحص ضغط دم المريض كل 4 ساعات."
  },
  {
    "word": "pulse",
    "ipa": "[pʌls] (بَلس)",
    "meaning": "النبض",
    "category": "vitals",
    "exampleEn": "Her pulse is 78 beats per minute.",
    "exampleAr": "نبضها 78 نبضة في الدقيقة."
  },
  {
    "word": "heart rate",
    "ipa": "[hɑːrt reɪt] (هارت ريت)",
    "meaning": "معدل ضربات القلب",
    "category": "vitals",
    "exampleEn": "The heart rate monitor shows 88 bpm.",
    "exampleAr": "جهاز مراقبة القلب بيوري 88 نبضة/دقيقة."
  },
  {
    "word": "temperature",
    "ipa": "[ˈtemprətʃər] (تِمبرَتشَر)",
    "meaning": "درجة الحرارة",
    "category": "vitals",
    "exampleEn": "Please take the patient's temperature.",
    "exampleAr": "من فضلك خد درجة حرارة المريض."
  },
  {
    "word": "respiratory rate",
    "ipa": "[rɪˈspɪrətɔːri reɪt] (رِسپيرَتوري ريت)",
    "meaning": "معدل التنفس",
    "category": "vitals",
    "exampleEn": "The respiratory rate is 16 breaths per minute.",
    "exampleAr": "معدل التنفس 16 نفس في الدقيقة."
  },
  {
    "word": "oxygen saturation",
    "ipa": "[ˈɒksɪdʒən ˌsætʃəˈreɪʃən] (أوكسيجِن ساتشوريشِن)",
    "meaning": "تشبع الأكسجين",
    "category": "vitals",
    "exampleEn": "His oxygen saturation is ninety-eight percent.",
    "exampleAr": "تشبع الأكسجين عنده 98%."
  },
  {
    "word": "body mass index",
    "ipa": "[ˈbɒdi mæs ˈɪndeks] (بادي ماس إندكس)",
    "meaning": "مؤشر كتلة الجسم",
    "category": "vitals",
    "exampleEn": "We calculate the body mass index using height and weight.",
    "exampleAr": "بنحسب مؤشر كتلة الجسم من الطول والوزن."
  },
  {
    "word": "weight",
    "ipa": "[weɪt] (ويت)",
    "meaning": "الوزن",
    "category": "vitals",
    "exampleEn": "Please record the patient's weight on admission.",
    "exampleAr": "سجّل وزن المريض وقت الدخول."
  },
  {
    "word": "height",
    "ipa": "[haɪt] (هايت)",
    "meaning": "الطول",
    "category": "vitals",
    "exampleEn": "The height is measured in centimeters.",
    "exampleAr": "الطول بيتقاس بالسنتيمتر."
  },
  {
    "word": "glucose level",
    "ipa": "[ˈɡluːkoʊs ˈlevəl] (جلوكوس ليڤِل)",
    "meaning": "مستوى السكر",
    "category": "vitals",
    "exampleEn": "Check the glucose level before breakfast.",
    "exampleAr": "افحص مستوى السكر قبل الفطار."
  },
  {
    "word": "chest",
    "ipa": "[tʃest] (تشِست)",
    "meaning": "الصدر",
    "category": "body",
    "exampleEn": "Listen to the chest with a stethoscope.",
    "exampleAr": "استمع للصدر بالسماعة."
  },
  {
    "word": "abdomen",
    "ipa": "[ˈæbdəmən] (أبدَمِن)",
    "meaning": "البطن",
    "category": "body",
    "exampleEn": "The abdomen is soft and non-tender.",
    "exampleAr": "البطن طري ومفيهوش ألم عند الضغط."
  },
  {
    "word": "lung",
    "ipa": "[lʌŋ] (لَنج)",
    "meaning": "الرئة",
    "category": "body",
    "exampleEn": "The right lung sounds clear.",
    "exampleAr": "الرئة اليمين صوتها طبيعي."
  },
  {
    "word": "kidney",
    "ipa": "[ˈkɪdni] (كِدني)",
    "meaning": "الكلية",
    "category": "body",
    "exampleEn": "Both kidneys function normally.",
    "exampleAr": "الكليتين شغالين طبيعي."
  },
  {
    "word": "liver",
    "ipa": "[ˈlɪvər] (لِڤَر)",
    "meaning": "الكبد",
    "category": "body",
    "exampleEn": "Liver function tests are normal.",
    "exampleAr": "تحاليل وظائف الكبد طبيعية."
  },
  {
    "word": "spine",
    "ipa": "[spaɪn] (سباين)",
    "meaning": "العمود الفقري",
    "category": "body",
    "exampleEn": "He complains of pain in the spine.",
    "exampleAr": "بيشتكي من ألم في العمود الفقري."
  },
  {
    "word": "joint",
    "ipa": "[dʒɔɪnt] (جوينت)",
    "meaning": "المفصل",
    "category": "body",
    "exampleEn": "The knee joint is swollen.",
    "exampleAr": "مفصل الركبة متورّم."
  },
  {
    "word": "vein",
    "ipa": "[veɪn] (ڤين)",
    "meaning": "الوريد",
    "category": "body",
    "exampleEn": "Insert the cannula into the vein.",
    "exampleAr": "دخّل الكانيولا في الوريد."
  },
  {
    "word": "artery",
    "ipa": "[ˈɑːrtəri] (آرتري)",
    "meaning": "الشريان",
    "category": "body",
    "exampleEn": "The artery supplies blood to the arm.",
    "exampleAr": "الشريان ده بيغذّي الدراع بالدم."
  },
  {
    "word": "skin",
    "ipa": "[skɪn] (سكِن)",
    "meaning": "الجلد",
    "category": "body",
    "exampleEn": "The skin around the wound is red.",
    "exampleAr": "الجلد حوالين الجرح أحمر."
  },
  {
    "word": "bone",
    "ipa": "[boʊn] (بون)",
    "meaning": "العظمة",
    "category": "body",
    "exampleEn": "The X-ray shows a fracture in the bone.",
    "exampleAr": "الأشعة بتوضح كسر في العظمة."
  },
  {
    "word": "wound",
    "ipa": "[wuːnd] (ووند)",
    "meaning": "الجرح",
    "category": "body",
    "exampleEn": "Clean the wound with saline.",
    "exampleAr": "نضّف الجرح بمحلول ملحي."
  },
  {
    "word": "pain",
    "ipa": "[peɪn] (پين)",
    "meaning": "الألم",
    "category": "symptoms",
    "exampleEn": "On a scale of one to ten, how bad is your pain?",
    "exampleAr": "على مقياس من واحد لعشرة، الألم قد إيه؟"
  },
  {
    "word": "nausea",
    "ipa": "[ˈnɔːziə] (نوزيا)",
    "meaning": "الغثيان",
    "category": "symptoms",
    "exampleEn": "The patient reports nausea after eating.",
    "exampleAr": "المريض بيشتكي من غثيان بعد الأكل."
  },
  {
    "word": "dizziness",
    "ipa": "[ˈdɪzinəs] (دِزينَس)",
    "meaning": "الدوخة",
    "category": "symptoms",
    "exampleEn": "She feels dizziness when standing up.",
    "exampleAr": "بتحس بدوخة لما تقف."
  },
  {
    "word": "fever",
    "ipa": "[ˈfiːvər] (فيڤَر)",
    "meaning": "الحمى/السخونية",
    "category": "symptoms",
    "exampleEn": "He has had a fever since yesterday.",
    "exampleAr": "عنده سخونية من امبارح."
  },
  {
    "word": "shortness of breath",
    "ipa": "[ˈʃɔːrtnəs əv breθ] (شورتنِس أوف بريث)",
    "meaning": "ضيق التنفس",
    "category": "symptoms",
    "exampleEn": "The patient complains of shortness of breath.",
    "exampleAr": "المريض بيشتكي من ضيق تنفس."
  },
  {
    "word": "swelling",
    "ipa": "[ˈsweliŋ] (سويلينج)",
    "meaning": "التورم",
    "category": "symptoms",
    "exampleEn": "There is swelling in the left ankle.",
    "exampleAr": "فيه تورّم في الكاحل الشمال."
  },
  {
    "word": "bleeding",
    "ipa": "[ˈbliːdɪŋ] (بليدينج)",
    "meaning": "النزيف",
    "category": "symptoms",
    "exampleEn": "Apply pressure to stop the bleeding.",
    "exampleAr": "اضغط عشان توقف النزيف."
  },
  {
    "word": "fatigue",
    "ipa": "[fəˈtiːɡ] (فَتيج)",
    "meaning": "الإرهاق",
    "category": "symptoms",
    "exampleEn": "She has been feeling constant fatigue.",
    "exampleAr": "حاسة بإرهاق مستمر."
  },
  {
    "word": "rash",
    "ipa": "[ræʃ] (راش)",
    "meaning": "طفح جلدي",
    "category": "symptoms",
    "exampleEn": "A rash appeared on his arm.",
    "exampleAr": "ظهر طفح جلدي على دراعه."
  },
  {
    "word": "cough",
    "ipa": "[kɒf] (كوف)",
    "meaning": "الكحة",
    "category": "symptoms",
    "exampleEn": "He has a dry cough for three days.",
    "exampleAr": "عنده كحة جافة من 3 أيام."
  },
  {
    "word": "vomiting",
    "ipa": "[ˈvɒmɪtɪŋ] (ڤوميتينج)",
    "meaning": "القيء",
    "category": "symptoms",
    "exampleEn": "The child had vomiting twice this morning.",
    "exampleAr": "الطفل ترجّع مرتين الصبح."
  },
  {
    "word": "chills",
    "ipa": "[tʃɪlz] (تشِلز)",
    "meaning": "الرعشة/القشعريرة",
    "category": "symptoms",
    "exampleEn": "He experienced chills before the fever started.",
    "exampleAr": "حس برعشة قبل ما السخونية تبدأ."
  },
  {
    "word": "diabetes",
    "ipa": "[ˌdaɪəˈbiːtiːz] (دايابيتيز)",
    "meaning": "السكري",
    "category": "diseases",
    "exampleEn": "He was diagnosed with type two diabetes.",
    "exampleAr": "اتشخّص بسكري النوع التاني."
  },
  {
    "word": "hypertension",
    "ipa": "[ˌhaɪpərˈtenʃən] (هايپَرتِنشِن)",
    "meaning": "ضغط الدم المرتفع",
    "category": "diseases",
    "exampleEn": "Hypertension increases the risk of stroke.",
    "exampleAr": "ضغط الدم المرتفع بيزود خطر السكتة الدماغية."
  },
  {
    "word": "asthma",
    "ipa": "[ˈæzmə] (أزما)",
    "meaning": "الربو",
    "category": "diseases",
    "exampleEn": "Her asthma is triggered by dust.",
    "exampleAr": "الربو عندها بيتحفّز من الغبار."
  },
  {
    "word": "infection",
    "ipa": "[ɪnˈfekʃən] (إنفكشِن)",
    "meaning": "العدوى/الالتهاب",
    "category": "diseases",
    "exampleEn": "The wound shows signs of infection.",
    "exampleAr": "الجرح بيوضح علامات التهاب."
  },
  {
    "word": "anemia",
    "ipa": "[əˈniːmiə] (أنيميا)",
    "meaning": "فقر الدم",
    "category": "diseases",
    "exampleEn": "The blood test confirmed anemia.",
    "exampleAr": "تحليل الدم أكّد فقر الدم."
  },
  {
    "word": "stroke",
    "ipa": "[stroʊk] (ستروك)",
    "meaning": "السكتة الدماغية",
    "category": "diseases",
    "exampleEn": "He was admitted after a stroke.",
    "exampleAr": "اتنقل للمستشفى بعد سكتة دماغية."
  },
  {
    "word": "fracture",
    "ipa": "[ˈfræktʃər] (فراكتشَر)",
    "meaning": "الكسر",
    "category": "diseases",
    "exampleEn": "The X-ray revealed a fracture in the leg.",
    "exampleAr": "الأشعة أظهرت كسر في الرجل."
  },
  {
    "word": "pneumonia",
    "ipa": "[nuːˈmoʊniə] (نيومونيا)",
    "meaning": "الالتهاب الرئوي",
    "category": "diseases",
    "exampleEn": "The patient was treated for pneumonia.",
    "exampleAr": "المريض اتعالج من التهاب رئوي."
  },
  {
    "word": "allergy",
    "ipa": "[ˈælərdʒi] (أليرجي)",
    "meaning": "الحساسية",
    "category": "diseases",
    "exampleEn": "Does he have any known allergy?",
    "exampleAr": "عنده أي حساسية معروفة؟"
  },
  {
    "word": "dehydration",
    "ipa": "[ˌdiːhaɪˈdreɪʃən] (ديهايدريشِن)",
    "meaning": "الجفاف",
    "category": "diseases",
    "exampleEn": "Signs of dehydration include dry mouth.",
    "exampleAr": "من علامات الجفاف جفاف الفم."
  },
  {
    "word": "to administer",
    "ipa": "[ˈædmɪnɪstər] (أدمِنِستَر)",
    "meaning": "يُعطي (دواء/علاج)",
    "category": "nursing_actions",
    "exampleEn": "The nurse will administer the medication at 8 AM.",
    "exampleAr": "الممرض هيديله الدوا الساعة 8 الصبح."
  },
  {
    "word": "to monitor",
    "ipa": "[ˈmɒnɪtər] (مونِتَر)",
    "meaning": "يراقب",
    "category": "nursing_actions",
    "exampleEn": "We need to monitor his vital signs closely.",
    "exampleAr": "لازم نراقب علاماته الحيوية عن قرب."
  },
  {
    "word": "to insert",
    "ipa": "[ɪnˈsɜːrt] (إنسِرت)",
    "meaning": "يُدخل (قسطرة/إبرة)",
    "category": "nursing_actions",
    "exampleEn": "Insert the IV line carefully.",
    "exampleAr": "دخّل خط الوريد بحرص."
  },
  {
    "word": "to dress a wound",
    "ipa": "[dres ə wuːnd] (درِس أ ووند)",
    "meaning": "يضمّد جرح",
    "category": "nursing_actions",
    "exampleEn": "The nurse will dress the wound now.",
    "exampleAr": "الممرض/ة هيضمّد الجرح دلوقتي."
  },
  {
    "word": "to discharge",
    "ipa": "[dɪsˈtʃɑːrdʒ] (دِسچارج)",
    "meaning": "يخرج المريض من المستشفى",
    "category": "nursing_actions",
    "exampleEn": "The doctor decided to discharge the patient today.",
    "exampleAr": "الدكتور قرر يخرّج المريض النهارده."
  },
  {
    "word": "to assess",
    "ipa": "[əˈses] (أسِس)",
    "meaning": "يقيّم الحالة",
    "category": "nursing_actions",
    "exampleEn": "Assess the patient's level of consciousness.",
    "exampleAr": "قيّم مستوى وعي المريض."
  },
  {
    "word": "to reassure",
    "ipa": "[ˌriːəˈʃʊr] (ريأشور)",
    "meaning": "يطمئن",
    "category": "nursing_actions",
    "exampleEn": "Reassure the patient before the procedure.",
    "exampleAr": "طمّن المريض قبل الإجراء."
  },
  {
    "word": "to elevate",
    "ipa": "[ˈeləveɪt] (إليفيت)",
    "meaning": "يرفع (طرف/عضو)",
    "category": "nursing_actions",
    "exampleEn": "Elevate the injured leg above the heart.",
    "exampleAr": "ارفع الرجل المصابة فوق مستوى القلب."
  },
  {
    "word": "to sanitize",
    "ipa": "[ˈsænɪtaɪz] (سانِتايز)",
    "meaning": "يُعقّم",
    "category": "nursing_actions",
    "exampleEn": "Sanitize your hands before touching the patient.",
    "exampleAr": "عقّم إيدك قبل ما تلمس المريض."
  },
  {
    "word": "to record",
    "ipa": "[rɪˈkɔːrd] (رِكورد)",
    "meaning": "يسجّل",
    "category": "nursing_actions",
    "exampleEn": "Record the intake and output accurately.",
    "exampleAr": "سجّل كمية السوائل الداخلة والخارجة بدقة."
  },
  {
    "word": "stethoscope",
    "ipa": "[ˈsteθəskoʊp] (سِتِثَسكوپ)",
    "meaning": "السماعة الطبية",
    "category": "equipment",
    "exampleEn": "The doctor used a stethoscope to check his lungs.",
    "exampleAr": "الدكتور استخدم السماعة عشان يفحص رئتيه."
  },
  {
    "word": "syringe",
    "ipa": "[səˈrɪndʒ] (سِرِنج)",
    "meaning": "المحقنة/السرنجة",
    "category": "equipment",
    "exampleEn": "Use a new syringe for each injection.",
    "exampleAr": "استخدم سرنجة جديدة لكل حقنة."
  },
  {
    "word": "catheter",
    "ipa": "[ˈkæθətər] (كاثِتَر)",
    "meaning": "القسطرة",
    "category": "equipment",
    "exampleEn": "The catheter needs to be changed regularly.",
    "exampleAr": "القسطرة لازم تتغيّر بانتظام."
  },
  {
    "word": "wheelchair",
    "ipa": "[ˈwiːltʃer] (ويلتشير)",
    "meaning": "الكرسي المتحرك",
    "category": "equipment",
    "exampleEn": "Bring a wheelchair for the patient.",
    "exampleAr": "هات كرسي متحرك للمريض."
  },
  {
    "word": "thermometer",
    "ipa": "[θərˈmɒmɪtər] (ثِرمومِتَر)",
    "meaning": "الترمومتر",
    "category": "equipment",
    "exampleEn": "Use the thermometer to check her temperature.",
    "exampleAr": "استخدم الترمومتر عشان تفحص حرارتها."
  },
  {
    "word": "gloves",
    "ipa": "[ɡlʌvz] (جلَڤز)",
    "meaning": "القفازات",
    "category": "equipment",
    "exampleEn": "Wear gloves before touching the wound.",
    "exampleAr": "البس قفازات قبل ما تلمس الجرح."
  },
  {
    "word": "bandage",
    "ipa": "[ˈbændɪdʒ] (باندِج)",
    "meaning": "الضمادة",
    "category": "equipment",
    "exampleEn": "Apply a clean bandage to the cut.",
    "exampleAr": "حط ضمادة نضيفة على الجرح."
  },
  {
    "word": "IV drip",
    "ipa": "[ˌaɪ ˈviː drɪp] (آي-ڤي دريپ)",
    "meaning": "المحلول الوريدي",
    "category": "equipment",
    "exampleEn": "The IV drip is running slowly.",
    "exampleAr": "المحلول الوريدي بينزل ببطء."
  },
  {
    "word": "oxygen mask",
    "ipa": "[ˈɒksɪdʒən mæsk] (أوكسِجِن ماسك)",
    "meaning": "قناع الأكسجين",
    "category": "equipment",
    "exampleEn": "Put the oxygen mask on the patient.",
    "exampleAr": "حط قناع الأكسجين على المريض."
  },
  {
    "word": "scalpel",
    "ipa": "[ˈskælpəl] (سكالپِل)",
    "meaning": "المشرط الجراحي",
    "category": "equipment",
    "exampleEn": "The surgeon requested a sterile scalpel.",
    "exampleAr": "الجرّاح طلب مشرط معقّم."
  },
  {
    "word": "dosage",
    "ipa": "[ˈdoʊsɪdʒ] (دوسِج)",
    "meaning": "الجرعة",
    "category": "pharmacy",
    "exampleEn": "Check the dosage before administering the drug.",
    "exampleAr": "تأكد من الجرعة قبل إعطاء الدواء."
  },
  {
    "word": "tablet",
    "ipa": "[ˈtæblət] (تابلِت)",
    "meaning": "قرص (دواء)",
    "category": "pharmacy",
    "exampleEn": "Take one tablet twice a day.",
    "exampleAr": "خد قرص مرتين في اليوم."
  },
  {
    "word": "capsule",
    "ipa": "[ˈkæpsjuːl] (كابسول)",
    "meaning": "كبسولة",
    "category": "pharmacy",
    "exampleEn": "Swallow the capsule with water.",
    "exampleAr": "بلع الكبسولة بمية."
  },
  {
    "word": "injection",
    "ipa": "[ɪnˈdʒekʃən] (إنجِكشِن)",
    "meaning": "الحقنة",
    "category": "pharmacy",
    "exampleEn": "The injection is given intramuscularly.",
    "exampleAr": "الحقنة بتتاخد في العضل."
  },
  {
    "word": "prescription",
    "ipa": "[prɪˈskrɪpʃən] (پرِسكرِپشِن)",
    "meaning": "الروشتة/الوصفة الطبية",
    "category": "pharmacy",
    "exampleEn": "The doctor wrote a new prescription.",
    "exampleAr": "الدكتور كتب روشتة جديدة."
  },
  {
    "word": "side effect",
    "ipa": "[saɪd ɪˈfekt] (سايد إفِكت)",
    "meaning": "الأعراض الجانبية",
    "category": "pharmacy",
    "exampleEn": "Nausea is a common side effect.",
    "exampleAr": "الغثيان من الأعراض الجانبية الشائعة."
  },
  {
    "word": "antibiotic",
    "ipa": "[ˌæntibaɪˈɒtɪk] (أنتي-بايوتِك)",
    "meaning": "مضاد حيوي",
    "category": "pharmacy",
    "exampleEn": "The doctor prescribed an antibiotic.",
    "exampleAr": "الدكتور وصف مضاد حيوي."
  },
  {
    "word": "painkiller",
    "ipa": "[ˈpeɪnkɪlər] (پين-كِلَر)",
    "meaning": "مسكّن ألم",
    "category": "pharmacy",
    "exampleEn": "Give her a painkiller for the headache.",
    "exampleAr": "هاتلها مسكّن ألم للصداع."
  },
  {
    "word": "dose",
    "ipa": "[doʊs] (دوس)",
    "meaning": "جرعة واحدة",
    "category": "pharmacy",
    "exampleEn": "Do not exceed the recommended dose.",
    "exampleAr": "متتخطاش الجرعة الموصى بيها."
  },
  {
    "word": "intravenous (IV)",
    "ipa": "[ˌɪntrəˈviːnəs] (إنترَ-ڤينَس)",
    "meaning": "عن طريق الوريد",
    "category": "pharmacy",
    "exampleEn": "The medication is given intravenously.",
    "exampleAr": "الدواء بيتاخد عن طريق الوريد."
  },
  {
    "word": "oral",
    "ipa": "[ˈɔːrəl] (أورَل)",
    "meaning": "عن طريق الفم",
    "category": "pharmacy",
    "exampleEn": "This medicine is for oral use only.",
    "exampleAr": "الدواء ده للاستخدام عن طريق الفم بس."
  },
  {
    "word": "expiry date",
    "ipa": "[ɪkˈspaɪəri deɪt] (إكسپايَري ديت)",
    "meaning": "تاريخ انتهاء الصلاحية",
    "category": "pharmacy",
    "exampleEn": "Always check the expiry date before use.",
    "exampleAr": "دايمًا افحص تاريخ الصلاحية قبل الاستخدام."
  },
  {
    "word": "pharmacist",
    "ipa": "[ˈfɑːrməsɪst] (فارماسِست)",
    "meaning": "الصيدلي",
    "category": "pharmacy",
    "exampleEn": "Ask the pharmacist about drug interactions.",
    "exampleAr": "اسأل الصيدلي عن تفاعلات الأدوية."
  },
  {
    "word": "emergency room",
    "ipa": "[ɪˈmɜːrdʒənsi ruːm] (إمِرجِنسي روم)",
    "meaning": "قسم الطوارئ",
    "category": "departments",
    "exampleEn": "He was rushed to the emergency room.",
    "exampleAr": "اتنقل بسرعة لقسم الطوارئ."
  },
  {
    "word": "intensive care unit (ICU)",
    "ipa": "[ɪnˈtensɪv ker ˈjuːnɪt] (إنتِنسِڤ كير يونِت)",
    "meaning": "العناية المركزة",
    "category": "departments",
    "exampleEn": "She is being monitored in the ICU.",
    "exampleAr": "بتتراقب في العناية المركزة."
  },
  {
    "word": "operating theatre",
    "ipa": "[ˈɒpəreɪtɪŋ ˈθiːətər] (أوپَريتِنج ثيَتَر)",
    "meaning": "غرفة العمليات",
    "category": "departments",
    "exampleEn": "The patient was taken to the operating theatre.",
    "exampleAr": "المريض اتنقل لغرفة العمليات."
  },
  {
    "word": "pediatrics",
    "ipa": "[ˌpiːdiˈætrɪks] (پيدياترِكس)",
    "meaning": "طب الأطفال",
    "category": "departments",
    "exampleEn": "She works in the pediatrics department.",
    "exampleAr": "بتشتغل في قسم طب الأطفال."
  },
  {
    "word": "maternity ward",
    "ipa": "[məˈtɜːrnəti wɔːrd] (مَتِرنِتي وورد)",
    "meaning": "قسم الولادة",
    "category": "departments",
    "exampleEn": "The maternity ward is on the third floor.",
    "exampleAr": "قسم الولادة في الدور التالت."
  },
  {
    "word": "radiology",
    "ipa": "[ˌreɪdiˈɒlədʒi] (ريديولوچي)",
    "meaning": "قسم الأشعة",
    "category": "departments",
    "exampleEn": "Send him to radiology for a chest X-ray.",
    "exampleAr": "ابعته لقسم الأشعة عشان أشعة صدر."
  },
  {
    "word": "outpatient clinic",
    "ipa": "[ˈaʊtpeɪʃənt ˈklɪnɪk] (أوتپيشِنت كلينِك)",
    "meaning": "العيادة الخارجية",
    "category": "departments",
    "exampleEn": "Follow-up will be at the outpatient clinic.",
    "exampleAr": "المتابعة هتكون في العيادة الخارجية."
  },
  {
    "word": "psychiatric ward",
    "ipa": "[ˌsaɪkiˈætrɪk wɔːrd] (سايكياترِك وورد)",
    "meaning": "قسم الطب النفسي",
    "category": "departments",
    "exampleEn": "He was transferred to the psychiatric ward.",
    "exampleAr": "اتنقل لقسم الطب النفسي."
  },
  {
    "word": "cardiac arrest",
    "ipa": "[ˈkɑːrdiæk əˈrest] (كاردياك أرِست)",
    "meaning": "السكتة القلبية",
    "category": "emergency",
    "exampleEn": "The team responded quickly to the cardiac arrest.",
    "exampleAr": "الفريق استجاب بسرعة للسكتة القلبية."
  },
  {
    "word": "CPR",
    "ipa": "[ˌsiː piː ˈɑːr] (سي-پي-آر)",
    "meaning": "الإنعاش القلبي الرئوي",
    "category": "emergency",
    "exampleEn": "Start CPR immediately.",
    "exampleAr": "ابدأ الإنعاش القلبي الرئوي فورًا."
  },
  {
    "word": "first aid",
    "ipa": "[ˈfɜːrst eɪd] (فِرست إيد)",
    "meaning": "الإسعافات الأولية",
    "category": "emergency",
    "exampleEn": "He received first aid at the scene.",
    "exampleAr": "استلم إسعافات أولية في مكان الحادث."
  },
  {
    "word": "ambulance",
    "ipa": "[ˈæmbjələns] (امبيولانس)",
    "meaning": "سيارة إسعاف",
    "category": "emergency",
    "exampleEn": "Call an ambulance immediately.",
    "exampleAr": "اطلب سيارة إسعاف فورًا."
  },
  {
    "word": "unconscious",
    "ipa": "[ʌnˈkɒnʃəs] (أنكونشَس)",
    "meaning": "فاقد الوعي",
    "category": "emergency",
    "exampleEn": "The patient was found unconscious.",
    "exampleAr": "المريض اتلاقى فاقد الوعي."
  },
  {
    "word": "overdose",
    "ipa": "[ˈoʊvərdoʊs] (أوڤَردوس)",
    "meaning": "جرعة زائدة",
    "category": "emergency",
    "exampleEn": "He was treated for a drug overdose.",
    "exampleAr": "اتعالج من جرعة زائدة من دواء."
  },
  {
    "word": "trauma",
    "ipa": "[ˈtrɔːmə] (تراوما)",
    "meaning": "إصابة/صدمة",
    "category": "emergency",
    "exampleEn": "The trauma team is on standby.",
    "exampleAr": "فريق الإصابات جاهز."
  },
  {
    "word": "medical record",
    "ipa": "[ˈmedɪkəl ˈrekərd] (مِدِكَل رِكورد)",
    "meaning": "الملف الطبي",
    "category": "admin",
    "exampleEn": "Update the patient's medical record.",
    "exampleAr": "حدّث الملف الطبي للمريض."
  },
  {
    "word": "consent form",
    "ipa": "[kənˈsent fɔːrm] (كونسِنت فورم)",
    "meaning": "استمارة الموافقة",
    "category": "admin",
    "exampleEn": "Please sign the consent form.",
    "exampleAr": "من فضلك وقّع استمارة الموافقة."
  },
  {
    "word": "shift handover",
    "ipa": "[ʃɪft ˈhændoʊvər] (شِفت هاند-أوڤَر)",
    "meaning": "تسليم الشيفت",
    "category": "admin",
    "exampleEn": "The shift handover starts at 7 AM.",
    "exampleAr": "تسليم الشيفت بيبدأ الساعة 7 الصبح."
  },
  {
    "word": "care plan",
    "ipa": "[ker plæn] (كير-پلان)",
    "meaning": "خطة الرعاية",
    "category": "admin",
    "exampleEn": "The care plan is reviewed daily.",
    "exampleAr": "خطة الرعاية بتتراجع يوميًا."
  },
  {
    "word": "next of kin",
    "ipa": "[nekst əv kɪn] (نِكست أوف كِن)",
    "meaning": "أقرب الأقارب",
    "category": "admin",
    "exampleEn": "We need to contact the next of kin.",
    "exampleAr": "لازم نتواصل مع أقرب الأقارب."
  },
  {
    "word": "NPO",
    "ipa": "[en piː oʊ] (إن-پي-أو)",
    "meaning": "ممنوع الأكل أو الشرب (Nothing by mouth)",
    "category": "abbreviations",
    "exampleEn": "The patient is NPO before surgery.",
    "exampleAr": "المريض ممنوع من الأكل والشرب قبل العملية."
  },
  {
    "word": "PRN",
    "ipa": "[piː ɑːr en] (پي-آر-إن)",
    "meaning": "عند الحاجة (as needed)",
    "category": "abbreviations",
    "exampleEn": "Give the painkiller PRN.",
    "exampleAr": "هات المسكّن عند الحاجة."
  },
  {
    "word": "BID",
    "ipa": "[biː aɪ diː] (بي-آي-دي)",
    "meaning": "مرتين يوميًا (twice a day)",
    "category": "abbreviations",
    "exampleEn": "Take this tablet BID.",
    "exampleAr": "خد القرص ده مرتين يوميًا."
  },
  {
    "word": "stat",
    "ipa": "[stæt] (ستات)",
    "meaning": "فورًا (immediately)",
    "category": "abbreviations",
    "exampleEn": "The doctor ordered blood tests stat.",
    "exampleAr": "الدكتور طلب تحاليل دم فورًا."
  },
  {
    "word": "DNR",
    "ipa": "[diː en ɑːr] (دي-إن-آر)",
    "meaning": "عدم الإنعاش (Do Not Resuscitate)",
    "category": "abbreviations",
    "exampleEn": "The family requested a DNR order.",
    "exampleAr": "العيلة طلبت أمر عدم الإنعاش."
  },
  {
    "word": "consent",
    "ipa": "[kənˈsent] (كونسِنت)",
    "meaning": "الموافقة (على إجراء طبي)",
    "category": "clinical_procedures",
    "exampleEn": "We need written consent before the operation.",
    "exampleAr": "محتاجين موافقة مكتوبة قبل العملية."
  },
  {
    "word": "informed consent",
    "ipa": "[ɪnˈfɔːrmd kənˈsent] (إنفورمد كونسِنت)",
    "meaning": "الموافقة المستنيرة",
    "category": "clinical_procedures",
    "exampleEn": "The doctor explained the risks to get informed consent.",
    "exampleAr": "الدكتور شرح المخاطر عشان ياخد موافقة مستنيرة."
  },
  {
    "word": "rehabilitation",
    "ipa": "[ˌriːəˌbɪlɪˈteɪʃən] (ريهابِلِتيشِن)",
    "meaning": "إعادة التأهيل",
    "category": "clinical_procedures",
    "exampleEn": "He started rehabilitation after his hip surgery.",
    "exampleAr": "بدأ إعادة تأهيل بعد عملية الورك."
  },
  {
    "word": "screening",
    "ipa": "[ˈskriːnɪŋ] (سكرينينج)",
    "meaning": "الفحص المبكر/الكشف",
    "category": "clinical_procedures",
    "exampleEn": "Regular screening can detect the disease early.",
    "exampleAr": "الفحص المبكر المنتظم يقدر يكتشف المرض بدري."
  },
  {
    "word": "catheterization",
    "ipa": "[ˌkæθətəraɪˈzeɪʃən] (كاثِتَرايزيشِن)",
    "meaning": "تركيب قسطرة",
    "category": "clinical_procedures",
    "exampleEn": "Catheterization was performed to drain the bladder.",
    "exampleAr": "تركيب قسطرة اتعمل عشان تفريغ المثانة."
  },
  {
    "word": "auscultation",
    "ipa": "[ˌɔːskəlˈteɪʃən] (أوسكَلتيشِن)",
    "meaning": "الاستماع بالسماعة",
    "category": "clinical_procedures",
    "exampleEn": "Auscultation of the chest revealed normal breath sounds.",
    "exampleAr": "الاستماع بالسماعة أظهر أصوات تنفس طبيعية."
  },
  {
    "word": "palpation",
    "ipa": "[pælˈpeɪʃən] (پالپيشِن)",
    "meaning": "الفحص باللمس",
    "category": "clinical_procedures",
    "exampleEn": "Palpation of the abdomen showed no tenderness.",
    "exampleAr": "الفحص باللمس للبطن مفيهوش ألم."
  },
  {
    "word": "suture",
    "ipa": "[ˈsuːtʃər] (سوتشَر)",
    "meaning": "الغرزة الجراحية",
    "category": "clinical_procedures",
    "exampleEn": "The wound needed five sutures.",
    "exampleAr": "الجرح احتاج خمس غرز."
  },
  {
    "word": "biopsy",
    "ipa": "[ˈbaɪɒpsi] (بايوپسي)",
    "meaning": "خزعة (عيّنة نسيج)",
    "category": "clinical_procedures",
    "exampleEn": "A biopsy will confirm the diagnosis.",
    "exampleAr": "الخزعة هتأكد التشخيص."
  },
  {
    "word": "resuscitation",
    "ipa": "[rɪˌsʌsɪˈteɪʃən] (رِسَسِتيشِن)",
    "meaning": "الإنعاش",
    "category": "clinical_procedures",
    "exampleEn": "The team began resuscitation immediately.",
    "exampleAr": "الفريق بدأ الإنعاش فورًا."
  },
  {
    "word": "triage",
    "ipa": "[triˈɑːʒ] (تريَاج)",
    "meaning": "الفرز الطبي (حسب خطورة الحالة)",
    "category": "clinical_procedures",
    "exampleEn": "Patients are assessed at triage first.",
    "exampleAr": "المرضى بيتقيّموا في الفرز الطبي الأول."
  },
  {
    "word": "mobility aid",
    "ipa": "[moʊˈbɪləti eɪd] (موبيلِتي إيد)",
    "meaning": "وسيلة مساعدة على الحركة",
    "category": "clinical_procedures",
    "exampleEn": "He uses a mobility aid to walk safely.",
    "exampleAr": "بيستخدم وسيلة مساعدة عشان يمشي بأمان."
  },
  {
    "word": "splint",
    "ipa": "[splɪnt] (سپلِنت)",
    "meaning": "الجبيرة",
    "category": "clinical_procedures",
    "exampleEn": "A splint was applied to immobilize the wrist.",
    "exampleAr": "اتحطت جبيرة عشان تثبيت الرسغ."
  },
  {
    "word": "sling",
    "ipa": "[slɪŋ] (سلِنج)",
    "meaning": "رباط تعليق (للذراع)",
    "category": "clinical_procedures",
    "exampleEn": "The arm was placed in a sling.",
    "exampleAr": "الدراع اتحطت في رباط تعليق."
  },
  {
    "word": "cast",
    "ipa": "[kæst] (كاست)",
    "meaning": "الجبس",
    "category": "clinical_procedures",
    "exampleEn": "The broken arm needs a cast for six weeks.",
    "exampleAr": "الدراع المكسورة محتاجة جبس لستة أسابيع."
  },
  {
    "word": "dialysis",
    "ipa": "[daɪˈæləsɪs] (دايالِسِس)",
    "meaning": "الغسيل الكلوي",
    "category": "clinical_procedures",
    "exampleEn": "He undergoes dialysis three times a week.",
    "exampleAr": "بياخد غسيل كلوي 3 مرات أسبوعيًا."
  },
  {
    "word": "blood transfusion",
    "ipa": "[blʌd trænsˈfjuːʒən] (بلَد ترانسفيوچِن)",
    "meaning": "نقل الدم",
    "category": "clinical_procedures",
    "exampleEn": "She received a blood transfusion after the accident.",
    "exampleAr": "استلمت نقل دم بعد الحادثة."
  },
  {
    "word": "anesthesia",
    "ipa": "[ˌænəsˈθiːʒə] (أنِسثيچا)",
    "meaning": "التخدير",
    "category": "clinical_procedures",
    "exampleEn": "General anesthesia was used for the surgery.",
    "exampleAr": "استُخدم تخدير كلي للعملية."
  },
  {
    "word": "preoperative",
    "ipa": "[ˌpriːˈɒpərətɪv] (پري-أوپِرَتِڤ)",
    "meaning": "ما قبل العملية",
    "category": "clinical_procedures",
    "exampleEn": "Preoperative fasting is required for eight hours.",
    "exampleAr": "الصيام قبل العملية مطلوب لثماني ساعات."
  },
  {
    "word": "postoperative",
    "ipa": "[ˌpoʊstˈɒpərətɪv] (پوست-أوپِرَتِڤ)",
    "meaning": "ما بعد العملية",
    "category": "clinical_procedures",
    "exampleEn": "Postoperative pain is managed with medication.",
    "exampleAr": "ألم ما بعد العملية بيتحكم فيه بالدواء."
  },
  {
    "word": "colostomy",
    "ipa": "[kəˈlɒstəmi] (كولوستَمي)",
    "meaning": "فغر القولون",
    "category": "clinical_procedures",
    "exampleEn": "He was taught how to care for his colostomy.",
    "exampleAr": "اتعلّم إزاي يعتني بفغر القولون."
  },
  {
    "word": "nasogastric tube (NG tube)",
    "ipa": "[ˌneɪzoʊˈɡæstrɪk tuːb] (نيزو-جاسترِك تيوب)",
    "meaning": "أنبوب أنفي معدي",
    "category": "clinical_procedures",
    "exampleEn": "Feeding was given through the nasogastric tube.",
    "exampleAr": "التغذية اتدت عن طريق الأنبوب الأنفي المعدي."
  },
  {
    "word": "wound dressing",
    "ipa": "[wuːnd ˈdresɪŋ] (ووند دريسِنج)",
    "meaning": "تضميد الجرح",
    "category": "clinical_procedures",
    "exampleEn": "The wound dressing should be changed daily.",
    "exampleAr": "تضميد الجرح لازم يتغيّر يوميًا."
  },
  {
    "word": "diagnosis",
    "ipa": "[ˌdaɪəɡˈnoʊsɪs] (دايَجنوسِس)",
    "meaning": "التشخيص",
    "category": "diagnostics",
    "exampleEn": "The final diagnosis was confirmed by the lab results.",
    "exampleAr": "التشخيص النهائي اتأكد بنتيجة المعمل."
  },
  {
    "word": "prognosis",
    "ipa": "[prɒɡˈnoʊsɪs] (پروجنوسِس)",
    "meaning": "التوقع/المآل المرضي",
    "category": "diagnostics",
    "exampleEn": "The prognosis is good with early treatment.",
    "exampleAr": "التوقع المرضي كويس مع العلاج المبكر."
  },
  {
    "word": "symptom",
    "ipa": "[ˈsɪmptəm] (سِمپتَم)",
    "meaning": "العرَض (اللي المريض بيحس بيه)",
    "category": "diagnostics",
    "exampleEn": "Fatigue is a common symptom of anemia.",
    "exampleAr": "الإرهاق عرَض شائع لفقر الدم."
  },
  {
    "word": "sign",
    "ipa": "[saɪn] (ساين)",
    "meaning": "العلامة (اللي الطبيب بيلاحظها)",
    "category": "diagnostics",
    "exampleEn": "A rash is a visible sign of the allergy.",
    "exampleAr": "الطفح الجلدي علامة واضحة للحساسية."
  },
  {
    "word": "X-ray",
    "ipa": "[ˈeks reɪ] (إكس-راي)",
    "meaning": "الأشعة السينية",
    "category": "diagnostics",
    "exampleEn": "The X-ray shows no fracture.",
    "exampleAr": "الأشعة السينية مفيهاش كسر."
  },
  {
    "word": "ultrasound",
    "ipa": "[ˈʌltrəsaʊnd] (ألترا-ساوند)",
    "meaning": "الموجات فوق الصوتية",
    "category": "diagnostics",
    "exampleEn": "An ultrasound was done to check the baby.",
    "exampleAr": "اتعملت موجات فوق صوتية عشان تفحص الجنين."
  },
  {
    "word": "MRI scan",
    "ipa": "[ˌem ɑːr ˈaɪ skæn] (إم-آر-آي سكان)",
    "meaning": "الرنين المغناطيسي",
    "category": "diagnostics",
    "exampleEn": "The MRI scan revealed a herniated disc.",
    "exampleAr": "الرنين المغناطيسي أظهر انزلاق غضروفي."
  },
  {
    "word": "CT scan",
    "ipa": "[ˌsiː ˈtiː skæn] (سي-تي سكان)",
    "meaning": "الأشعة المقطعية",
    "category": "diagnostics",
    "exampleEn": "A CT scan was ordered to check for internal bleeding.",
    "exampleAr": "اتطلب أشعة مقطعية عشان يتفحص نزيف داخلي."
  },
  {
    "word": "blood test",
    "ipa": "[blʌd test] (بلَد تِست)",
    "meaning": "تحليل الدم",
    "category": "diagnostics",
    "exampleEn": "A blood test will check her cholesterol levels.",
    "exampleAr": "تحليل الدم هيفحص مستوى الكوليسترول عندها."
  },
  {
    "word": "tumor",
    "ipa": "[ˈtuːmər] (تيومَر)",
    "meaning": "الورم",
    "category": "diagnostics",
    "exampleEn": "The scan showed a small tumor in the lung.",
    "exampleAr": "الأشعة أظهرت ورم صغير في الرئة."
  },
  {
    "word": "malignant",
    "ipa": "[məˈlɪɡnənt] (مَلِجنَنت)",
    "meaning": "خبيث (سرطاني)",
    "category": "diagnostics",
    "exampleEn": "The biopsy confirmed the tumor was malignant.",
    "exampleAr": "الخزعة أكّدت إن الورم خبيث."
  },
  {
    "word": "benign",
    "ipa": "[bɪˈnaɪn] (بِنَاين)",
    "meaning": "حميد",
    "category": "diagnostics",
    "exampleEn": "Fortunately, the growth was benign.",
    "exampleAr": "لحسن الحظ الورم كان حميد."
  },
  {
    "word": "chronic",
    "ipa": "[ˈkrɒnɪk] (كرونِك)",
    "meaning": "مزمن",
    "category": "diagnostics",
    "exampleEn": "He has a chronic lung condition.",
    "exampleAr": "عنده حالة رئوية مزمنة."
  },
  {
    "word": "acute",
    "ipa": "[əˈkjuːt] (أكيوت)",
    "meaning": "حاد (مفاجئ وشديد)",
    "category": "diagnostics",
    "exampleEn": "She was admitted with acute abdominal pain.",
    "exampleAr": "اتنقلت للمستشفى بألم بطن حاد."
  },
  {
    "word": "anxiety",
    "ipa": "[æŋˈzaɪəti] (أنزايِتي)",
    "meaning": "القلق",
    "category": "mental_health",
    "exampleEn": "The patient shows signs of anxiety before surgery.",
    "exampleAr": "المريض بيوضح علامات قلق قبل العملية."
  },
  {
    "word": "depression",
    "ipa": "[dɪˈpreʃən] (دِپريشِن)",
    "meaning": "الاكتئاب",
    "category": "mental_health",
    "exampleEn": "He has been treated for depression for a year.",
    "exampleAr": "بيتعالج من الاكتئاب من سنة."
  },
  {
    "word": "confusion",
    "ipa": "[kənˈfjuːʒən] (كونفيوچِن)",
    "meaning": "التخليط الذهني/الارتباك",
    "category": "mental_health",
    "exampleEn": "The elderly patient showed sudden confusion.",
    "exampleAr": "المريض المسن أظهر ارتباك ذهني مفاجئ."
  },
  {
    "word": "delirium",
    "ipa": "[dɪˈlɪriəm] (دِلِريَم)",
    "meaning": "الهذيان",
    "category": "mental_health",
    "exampleEn": "Delirium can be caused by infection in older adults.",
    "exampleAr": "الهذيان ممكن يسببه التهاب عند كبار السن."
  },
  {
    "word": "dementia",
    "ipa": "[dɪˈmenʃə] (دِمِنشا)",
    "meaning": "الخرف",
    "category": "mental_health",
    "exampleEn": "His grandmother was diagnosed with dementia.",
    "exampleAr": "جدته اتشخّصت بالخرف."
  },
  {
    "word": "Glasgow Coma Scale (GCS)",
    "ipa": "[ˈɡlæzɡoʊ ˈkoʊmə skeɪl] (جلازجو كوما سكيل)",
    "meaning": "مقياس جلاسكو للوعي",
    "category": "mental_health",
    "exampleEn": "His Glasgow Coma Scale score improved overnight.",
    "exampleAr": "درجته على مقياس جلاسكو للوعي تحسّنت طول الليل."
  },
  {
    "word": "mobility",
    "ipa": "[moʊˈbɪləti] (موبيلِتي)",
    "meaning": "القدرة على الحركة",
    "category": "mental_health",
    "exampleEn": "Her mobility has decreased since the fall.",
    "exampleAr": "قدرتها على الحركة قلّت من وقت السقوط."
  },
  {
    "word": "incontinence",
    "ipa": "[ɪnˈkɒntɪnəns] (إنكونتِنَنس)",
    "meaning": "سلس البول/البراز",
    "category": "mental_health",
    "exampleEn": "Incontinence is common after certain surgeries.",
    "exampleAr": "سلس البول شائع بعد بعض العمليات."
  },
  {
    "word": "pressure ulcer (bed sore)",
    "ipa": "[ˈpreʃər ˈʌlsər] (پريشَر ألسَر)",
    "meaning": "قرحة الفراش",
    "category": "mental_health",
    "exampleEn": "Turn the patient regularly to prevent pressure ulcers.",
    "exampleAr": "قلّب المريض بانتظام عشان تمنع قرح الفراش."
  },
  {
    "word": "hospice care",
    "ipa": "[ˈhɒspɪs ker] (هوسپِس كير)",
    "meaning": "الرعاية التلطيفية النهائية",
    "category": "mental_health",
    "exampleEn": "The family chose hospice care for comfort.",
    "exampleAr": "العيلة اختارت الرعاية التلطيفية للراحة."
  },
  {
    "word": "palliative care",
    "ipa": "[ˈpæliətɪv ker] (پاليَتِڤ كير)",
    "meaning": "الرعاية التلطيفية (تخفيف الألم)",
    "category": "mental_health",
    "exampleEn": "Palliative care focuses on comfort, not cure.",
    "exampleAr": "الرعاية التلطيفية بتركز على الراحة مش الشفاء."
  },
  {
    "word": "infection control",
    "ipa": "[ɪnˈfekʃən kənˈtroʊl] (إنفِكشِن كونترول)",
    "meaning": "مكافحة العدوى",
    "category": "infection_control",
    "exampleEn": "Infection control policies must be followed strictly.",
    "exampleAr": "سياسات مكافحة العدوى لازم تتطبّق بدقة."
  },
  {
    "word": "isolation ward",
    "ipa": "[ˌaɪsəˈleɪʃən wɔːrd] (آيسوليشِن وورد)",
    "meaning": "قسم العزل",
    "category": "infection_control",
    "exampleEn": "The patient was moved to the isolation ward.",
    "exampleAr": "المريض اتنقل لقسم العزل."
  },
  {
    "word": "PPE (personal protective equipment)",
    "ipa": "[piː piː iː] (پي-پي-إي)",
    "meaning": "معدات الوقاية الشخصية",
    "category": "infection_control",
    "exampleEn": "Always wear PPE when handling infectious material.",
    "exampleAr": "دايمًا البس معدات الوقاية عند التعامل مع مواد معدية."
  },
  {
    "word": "sterile",
    "ipa": "[ˈsterəl] (ستِرَل)",
    "meaning": "معقّم",
    "category": "infection_control",
    "exampleEn": "Use sterile gloves during the procedure.",
    "exampleAr": "استخدم قفازات معقّمة أثناء الإجراء."
  },
  {
    "word": "contamination",
    "ipa": "[kənˌtæmɪˈneɪʃən] (كونتامِنيشِن)",
    "meaning": "التلوث",
    "category": "infection_control",
    "exampleEn": "Avoid contamination of the wound site.",
    "exampleAr": "تجنّب تلوث منطقة الجرح."
  },
  {
    "word": "contagious",
    "ipa": "[kənˈteɪdʒəs] (كونتيچَس)",
    "meaning": "معدي (ينتقل بسهولة)",
    "category": "infection_control",
    "exampleEn": "The virus is highly contagious.",
    "exampleAr": "الفيروس ده معدي جدًا."
  },
  {
    "word": "hand hygiene",
    "ipa": "[hænd ˈhaɪdʒiːn] (هاند-هايچين)",
    "meaning": "نظافة اليدين",
    "category": "infection_control",
    "exampleEn": "Hand hygiene reduces the spread of infection.",
    "exampleAr": "نظافة اليدين بتقلّل انتشار العدوى."
  },
  {
    "word": "quarantine",
    "ipa": "[ˈkwɒrəntiːn] (كوارَنتين)",
    "meaning": "الحجر الصحي",
    "category": "infection_control",
    "exampleEn": "Close contacts were placed under quarantine.",
    "exampleAr": "المخالطين اتحطّوا تحت حجر صحي."
  },
  {
    "word": "discharge summary",
    "ipa": "[ˈdɪstʃɑːrdʒ ˈsʌməri] (دِسچارج سَمَري)",
    "meaning": "ملخص خروج المريض",
    "category": "general_oet",
    "exampleEn": "Complete the discharge summary before the patient leaves.",
    "exampleAr": "خلّص ملخص الخروج قبل ما المريض يمشي."
  },
  {
    "word": "referral",
    "ipa": "[rɪˈfɜːrəl] (رِفِرَل)",
    "meaning": "التحويل الطبي",
    "category": "general_oet",
    "exampleEn": "The GP made a referral to a specialist.",
    "exampleAr": "طبيب الأسرة عمل تحويل لأخصائي."
  },
  {
    "word": "follow-up appointment",
    "ipa": "[ˈfɒloʊ ʌp əˈpɔɪntmənt] (فولو-أپ أپوينتمِنت)",
    "meaning": "موعد المتابعة",
    "category": "general_oet",
    "exampleEn": "Book a follow-up appointment in two weeks.",
    "exampleAr": "احجز موعد متابعة بعد أسبوعين."
  },
  {
    "word": "obesity",
    "ipa": "[oʊˈbiːsəti] (أوبيسِتي)",
    "meaning": "السمنة",
    "category": "general_oet",
    "exampleEn": "Obesity increases the risk of diabetes.",
    "exampleAr": "السمنة بتزود خطر الإصابة بالسكري."
  },
  {
    "word": "malnutrition",
    "ipa": "[ˌmælnjuːˈtrɪʃən] (مال-نيوتريشِن)",
    "meaning": "سوء التغذية",
    "category": "general_oet",
    "exampleEn": "Malnutrition is common among elderly patients.",
    "exampleAr": "سوء التغذية شائع عند كبار السن."
  },
  {
    "word": "immunization",
    "ipa": "[ˌɪmjənaɪˈzeɪʃən] (إميونايزيشِن)",
    "meaning": "التطعيم",
    "category": "general_oet",
    "exampleEn": "Immunization records must be updated.",
    "exampleAr": "سجلات التطعيم لازم تتحدّث."
  },
  {
    "word": "vaccine",
    "ipa": "[vækˈsiːn] (فاكسين)",
    "meaning": "اللقاح",
    "category": "general_oet",
    "exampleEn": "The vaccine is given in two doses.",
    "exampleAr": "اللقاح بياخد جرعتين."
  },
  {
    "word": "insulin",
    "ipa": "[ˈɪnsəlɪn] (إنسولِن)",
    "meaning": "الأنسولين",
    "category": "general_oet",
    "exampleEn": "He injects insulin twice daily.",
    "exampleAr": "بياخد حقنة أنسولين مرتين يوميًا."
  },
  {
    "word": "hypoglycemia",
    "ipa": "[ˌhaɪpoʊɡlaɪˈsiːmiə] (هايپو-جلايسيميا)",
    "meaning": "انخفاض سكر الدم",
    "category": "general_oet",
    "exampleEn": "She felt shaky due to hypoglycemia.",
    "exampleAr": "حست بارتجاف بسبب انخفاض سكر الدم."
  },
  {
    "word": "hyperglycemia",
    "ipa": "[ˌhaɪpərɡlaɪˈsiːmiə] (هايپَر-جلايسيميا)",
    "meaning": "ارتفاع سكر الدم",
    "category": "general_oet",
    "exampleEn": "Untreated hyperglycemia can cause complications.",
    "exampleAr": "ارتفاع السكر غير المعالج ممكن يسبب مضاعفات."
  },
  {
    "word": "edema",
    "ipa": "[ɪˈdiːmə] (إيديما)",
    "meaning": "الوذمة (تورم بسبب سوائل)",
    "category": "general_oet",
    "exampleEn": "There is edema in both ankles.",
    "exampleAr": "فيه وذمة في الكاحلين."
  },
  {
    "word": "hematoma",
    "ipa": "[ˌhiːməˈtoʊmə] (هيماتوما)",
    "meaning": "التجمع الدموي",
    "category": "general_oet",
    "exampleEn": "A hematoma formed after the injection.",
    "exampleAr": "تجمع دموي اتكوّن بعد الحقنة."
  },
  {
    "word": "bruise",
    "ipa": "[bruːz] (بروز)",
    "meaning": "الكدمة",
    "category": "general_oet",
    "exampleEn": "He has a bruise on his left arm.",
    "exampleAr": "عنده كدمة في دراعه الشمال."
  },
  {
    "word": "laceration",
    "ipa": "[ˌlæsəˈreɪʃən] (لاسِريشِن)",
    "meaning": "التمزق (جرح قطعي)",
    "category": "general_oet",
    "exampleEn": "The laceration required stitches.",
    "exampleAr": "التمزق احتاج غرز."
  },
  {
    "word": "obese",
    "ipa": "[oʊˈbiːs] (أوبيس)",
    "meaning": "مصاب بالسمنة",
    "category": "general_oet",
    "exampleEn": "The patient is classified as obese.",
    "exampleAr": "المريض مصنّف إنه عنده سمنة."
  },
  {
    "word": "nutrition",
    "ipa": "[nuːˈtrɪʃən] (نيوتريشِن)",
    "meaning": "التغذية",
    "category": "general_oet",
    "exampleEn": "Good nutrition speeds up recovery.",
    "exampleAr": "التغذية الكويسة بتسرّع الشفاء."
  },
  {
    "word": "hygiene",
    "ipa": "[ˈhaɪdʒiːn] (هايچين)",
    "meaning": "النظافة الصحية",
    "category": "general_oet",
    "exampleEn": "Personal hygiene is important for infection prevention.",
    "exampleAr": "النظافة الشخصية مهمة للوقاية من العدوى."
  },
  {
    "word": "posture",
    "ipa": "[ˈpɒstʃər] (پوستشَر)",
    "meaning": "وضعية الجسم",
    "category": "general_oet",
    "exampleEn": "Correct posture reduces back pain.",
    "exampleAr": "وضعية الجسم الصح بتقلّل ألم الضهر."
  },
  {
    "word": "exhausted",
    "ipa": "[ɪɡˈzɔːstɪd] (إجزوستِد)",
    "meaning": "منهك تمامًا",
    "category": "general_oet",
    "exampleEn": "The night shift left her exhausted.",
    "exampleAr": "شيفت الليل خلّاها منهكة."
  },
  {
    "word": "vigorous",
    "ipa": "[ˈvɪɡərəs] (فيجَرَس)",
    "meaning": "نشيط/بقوة",
    "category": "general_oet",
    "exampleEn": "Avoid vigorous exercise right after surgery.",
    "exampleAr": "تجنّب الرياضة القوية فورًا بعد العملية."
  },
  {
    "word": "heartburn",
    "ipa": "[ˈhɑːrtbɜːrn] (هارت-بِرن)",
    "meaning": "حرقة المعدة",
    "category": "general_oet",
    "exampleEn": "He complains of heartburn after meals.",
    "exampleAr": "بيشتكي من حرقة معدة بعد الأكل."
  },
  {
    "word": "diuretic",
    "ipa": "[ˌdaɪəˈretɪk] (دايَ-رِتِك)",
    "meaning": "دواء مدرّ للبول",
    "category": "general_oet",
    "exampleEn": "The diuretic helps reduce fluid retention.",
    "exampleAr": "المدرّ للبول بيساعد يقلّل احتباس السوائل."
  },
  {
    "word": "scope of practice",
    "ipa": "[skoʊp əv ˈpræktɪs] (سكوپ أوف براكتِس)",
    "meaning": "نطاق الممارسة المهنية",
    "category": "general_oet",
    "exampleEn": "This procedure is outside her scope of practice.",
    "exampleAr": "الإجراء ده خارج نطاق ممارستها المهنية."
  },
  {
    "word": "pregnant",
    "ipa": "[ˈpreɡnənt] (پرِجنَنت)",
    "meaning": "حامل",
    "category": "obstetrics_pediatrics",
    "exampleEn": "She is eight months pregnant.",
    "exampleAr": "هي حامل في الشهر التامن."
  },
  {
    "word": "labor",
    "ipa": "[ˈleɪbər] (ليبَر)",
    "meaning": "المخاض",
    "category": "obstetrics_pediatrics",
    "exampleEn": "She went into labor at midnight.",
    "exampleAr": "دخلت في المخاض نص الليل."
  },
  {
    "word": "contraction",
    "ipa": "[kənˈtrækʃən] (كونتراكشِن)",
    "meaning": "انقباضة الرحم",
    "category": "obstetrics_pediatrics",
    "exampleEn": "Contractions are five minutes apart.",
    "exampleAr": "الانقباضات بينها خمس دقايق."
  },
  {
    "word": "delivery",
    "ipa": "[dɪˈlɪvəri] (دِلِڤَري)",
    "meaning": "الولادة",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The delivery went smoothly.",
    "exampleAr": "الولادة اتمّت بسلاسة."
  },
  {
    "word": "cesarean section (C-section)",
    "ipa": "[sɪˈzeriən ˈsekʃən] (سِزيريَن سِكشِن)",
    "meaning": "الولادة القيصرية",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The doctor recommended a cesarean section.",
    "exampleAr": "الدكتور نصح بولادة قيصرية."
  },
  {
    "word": "midwife",
    "ipa": "[ˈmɪdwaɪf] (مِدوايف)",
    "meaning": "القابلة",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The midwife assisted with the birth.",
    "exampleAr": "القابلة ساعدت في الولادة."
  },
  {
    "word": "prenatal care",
    "ipa": "[ˌpriːˈneɪtəl ker] (پري-نيتَل كير)",
    "meaning": "رعاية ما قبل الولادة",
    "category": "obstetrics_pediatrics",
    "exampleEn": "Prenatal care is important for a healthy pregnancy.",
    "exampleAr": "الرعاية قبل الولادة مهمة لحمل صحي."
  },
  {
    "word": "postpartum",
    "ipa": "[poʊstˈpɑːrtəm] (پوست-پارتَم)",
    "meaning": "ما بعد الولادة",
    "category": "obstetrics_pediatrics",
    "exampleEn": "Postpartum recovery takes several weeks.",
    "exampleAr": "التعافي بعد الولادة بياخد كذا أسبوع."
  },
  {
    "word": "newborn",
    "ipa": "[ˈnuːbɔːrn] (نيوبورن)",
    "meaning": "المولود الجديد",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The newborn weighed three kilograms.",
    "exampleAr": "المولود وزنه 3 كيلو."
  },
  {
    "word": "premature",
    "ipa": "[ˌpriːməˈtʃʊr] (پريماتيور)",
    "meaning": "خديج/مبتسر",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The baby was born premature at 32 weeks.",
    "exampleAr": "الطفل اتولد خديج في الأسبوع 32."
  },
  {
    "word": "miscarriage",
    "ipa": "[ˈmɪskærɪdʒ] (مِسكارِدج)",
    "meaning": "الإجهاض التلقائي",
    "category": "obstetrics_pediatrics",
    "exampleEn": "She suffered a miscarriage last year.",
    "exampleAr": "حصلها إجهاض تلقائي السنة اللي فاتت."
  },
  {
    "word": "fetus",
    "ipa": "[ˈfiːtəs] (فيتَس)",
    "meaning": "الجنين",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The fetus's heartbeat is normal.",
    "exampleAr": "نبض قلب الجنين طبيعي."
  },
  {
    "word": "breastfeeding",
    "ipa": "[ˈbrestfiːdɪŋ] (برِست-فيدينج)",
    "meaning": "الرضاعة الطبيعية",
    "category": "obstetrics_pediatrics",
    "exampleEn": "Breastfeeding is recommended for six months.",
    "exampleAr": "الرضاعة الطبيعية موصى بيها لستة أشهر."
  },
  {
    "word": "immunization schedule",
    "ipa": "[ˌɪmjənaɪˈzeɪʃən ˈskedʒuːl] (إميونايزيشِن سكِديول)",
    "meaning": "جدول التطعيمات",
    "category": "obstetrics_pediatrics",
    "exampleEn": "Follow the immunization schedule for infants.",
    "exampleAr": "اتّبع جدول التطعيمات للرضّع."
  },
  {
    "word": "growth chart",
    "ipa": "[ɡroʊθ tʃɑːrt] (جروث تشارت)",
    "meaning": "مخطط النمو",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The doctor checked the growth chart.",
    "exampleAr": "الدكتور فحص مخطط النمو."
  },
  {
    "word": "teething",
    "ipa": "[ˈtiːðɪŋ] (تيذينج)",
    "meaning": "التسنين",
    "category": "obstetrics_pediatrics",
    "exampleEn": "The baby is fussy because of teething.",
    "exampleAr": "الطفل عصبي بسبب التسنين."
  },
  {
    "word": "skull",
    "ipa": "[skʌl] (سكَل)",
    "meaning": "الجمجمة",
    "category": "anatomy_extra",
    "exampleEn": "The X-ray shows the skull clearly.",
    "exampleAr": "الأشعة بتوضح الجمجمة بوضوح."
  },
  {
    "word": "spinal cord",
    "ipa": "[ˈspaɪnəl kɔːrd] (سباينَل كورد)",
    "meaning": "الحبل الشوكي",
    "category": "anatomy_extra",
    "exampleEn": "The spinal cord was not injured.",
    "exampleAr": "الحبل الشوكي مالوش إصابة."
  },
  {
    "word": "pancreas",
    "ipa": "[ˈpæŋkriəs] (پانكرياس)",
    "meaning": "البنكرياس",
    "category": "anatomy_extra",
    "exampleEn": "The pancreas produces insulin.",
    "exampleAr": "البنكرياس بينتج الأنسولين."
  },
  {
    "word": "bladder",
    "ipa": "[ˈblædər] (بلادَر)",
    "meaning": "المثانة",
    "category": "anatomy_extra",
    "exampleEn": "The bladder was full on examination.",
    "exampleAr": "المثانة كانت ممتلئة عند الفحص."
  },
  {
    "word": "intestine",
    "ipa": "[ɪnˈtestɪn] (إنتِستِن)",
    "meaning": "الأمعاء",
    "category": "anatomy_extra",
    "exampleEn": "The small intestine absorbs nutrients.",
    "exampleAr": "الأمعاء الدقيقة بتمتص العناصر الغذائية."
  },
  {
    "word": "muscle",
    "ipa": "[ˈmʌsəl] (مَسِل)",
    "meaning": "العضلة",
    "category": "anatomy_extra",
    "exampleEn": "The muscle is sore after exercise.",
    "exampleAr": "العضلة متألمة بعد الرياضة."
  },
  {
    "word": "tendon",
    "ipa": "[ˈtendən] (تِندَن)",
    "meaning": "الوتر",
    "category": "anatomy_extra",
    "exampleEn": "He tore a tendon in his knee.",
    "exampleAr": "قطع وتر في ركبته."
  },
  {
    "word": "ligament",
    "ipa": "[ˈlɪɡəmənt] (لِجَمِنت)",
    "meaning": "الرباط (يصل العظام)",
    "category": "anatomy_extra",
    "exampleEn": "The ligament was strained.",
    "exampleAr": "الرباط اتشد."
  },
  {
    "word": "thigh",
    "ipa": "[θaɪ] (ثاي)",
    "meaning": "الفخذ",
    "category": "anatomy_extra",
    "exampleEn": "There is a bruise on his thigh.",
    "exampleAr": "فيه كدمة في فخذه."
  },
  {
    "word": "throat",
    "ipa": "[θroʊt] (ثروت)",
    "meaning": "الحلق",
    "category": "anatomy_extra",
    "exampleEn": "His throat is red and sore.",
    "exampleAr": "حلقه أحمر ومؤلم."
  },
  {
    "word": "tissue",
    "ipa": "[ˈtɪʃuː] (تِشو)",
    "meaning": "النسيج",
    "category": "anatomy_extra",
    "exampleEn": "The tissue sample was sent to the lab.",
    "exampleAr": "عيّنة النسيج اتبعتت للمعمل."
  },
  {
    "word": "gland",
    "ipa": "[ɡlænd] (جلاند)",
    "meaning": "الغدة",
    "category": "anatomy_extra",
    "exampleEn": "The thyroid gland regulates metabolism.",
    "exampleAr": "الغدة الدرقية بتنظّم عملية الأيض."
  },
  {
    "word": "Please lie down.",
    "ipa": "[pliːz laɪ daʊn] (پليز لاي داون)",
    "meaning": "من فضلك استلقي.",
    "category": "patient_instructions",
    "exampleEn": "Please lie down on the bed so I can examine you.",
    "exampleAr": "من فضلك استلقي على السرير عشان أفحصك."
  },
  {
    "word": "Take a deep breath.",
    "ipa": "[teɪk ə diːp breθ] (تيك أ ديپ بريث)",
    "meaning": "خد نفس عميق.",
    "category": "patient_instructions",
    "exampleEn": "Take a deep breath and hold it.",
    "exampleAr": "خد نفس عميق وامسكه."
  },
  {
    "word": "Roll onto your side.",
    "ipa": "[roʊl ˈɒntə jʊər saɪd] (رول أونتو يور سايد)",
    "meaning": "اترجّع على جنبك.",
    "category": "patient_instructions",
    "exampleEn": "Roll onto your side, please.",
    "exampleAr": "اترجّع على جنبك من فضلك."
  },
  {
    "word": "Squeeze my hand.",
    "ipa": "[skwiːz maɪ hænd] (سكويز ماي هاند)",
    "meaning": "اعصر إيدي.",
    "category": "patient_instructions",
    "exampleEn": "Squeeze my hand if you can hear me.",
    "exampleAr": "اعصر إيدي لو سامعني."
  },
  {
    "word": "Open your mouth.",
    "ipa": "[ˈoʊpən jʊər maʊθ] (أوپِن يور ماوث)",
    "meaning": "افتح فمك.",
    "category": "patient_instructions",
    "exampleEn": "Open your mouth so I can check your throat.",
    "exampleAr": "افتح فمك عشان أفحص حلقك."
  },
  {
    "word": "Does it hurt here?",
    "ipa": "[dʌz ɪt hɜːrt hɪr] (دَز إت هِرت هير)",
    "meaning": "بيوجعك هنا؟",
    "category": "patient_instructions",
    "exampleEn": "Does it hurt here when I press?",
    "exampleAr": "بيوجعك هنا لما أضغط؟"
  },
  {
    "word": "Try to relax.",
    "ipa": "[traɪ tuː rɪˈlæks] (تراي تو رِلاكس)",
    "meaning": "حاول تسترخي.",
    "category": "patient_instructions",
    "exampleEn": "Try to relax, this will only take a minute.",
    "exampleAr": "حاول تسترخي، ده هياخد دقيقة بس."
  },
  {
    "word": "You may feel a slight sting.",
    "ipa": "[juː meɪ fiːl ə slaɪt stɪŋ] (يو ماي فيل أ سلايت ستِنج)",
    "meaning": "ممكن تحس بوخزة خفيفة.",
    "category": "patient_instructions",
    "exampleEn": "You may feel a slight sting from the injection.",
    "exampleAr": "ممكن تحس بوخزة خفيفة من الحقنة."
  },
  {
    "word": "I'm going to check your pulse.",
    "ipa": "[aɪm ˈɡoʊɪŋ tuː tʃek jʊər pʌls] (آيم جوينج تو تشِك يور پَلس)",
    "meaning": "هفحص نبضك.",
    "category": "patient_instructions",
    "exampleEn": "I'm going to check your pulse now.",
    "exampleAr": "هفحص نبضك دلوقتي."
  },
  {
    "word": "Please don't eat or drink anything.",
    "ipa": "[pliːz doʊnt iːt ɔːr drɪŋk ˈeniθɪŋ] (پليز دونت إيت أور درِنك إني ثينج)",
    "meaning": "من فضلك متاكلش أو تشرب حاجة.",
    "category": "patient_instructions",
    "exampleEn": "Please don't eat or drink anything before the test.",
    "exampleAr": "من فضلك متاكلش أو تشرب حاجة قبل التحليل."
  },
  {
    "word": "intubation",
    "ipa": "[ˌɪntjuːˈbeɪʃən] (إنتيوبيشِن)",
    "meaning": "التنبيب (إدخال أنبوب للتنفس)",
    "category": "procedures_extra",
    "exampleEn": "Intubation was needed to secure his airway.",
    "exampleAr": "التنبيب كان مطلوب عشان تأمين مجرى تنفسه."
  },
  {
    "word": "venipuncture",
    "ipa": "[ˈviːnɪˌpʌŋktʃər] (ڤيني-پَنكتشَر)",
    "meaning": "بزل الوريد (لسحب دم)",
    "category": "procedures_extra",
    "exampleEn": "Venipuncture is used to collect a blood sample.",
    "exampleAr": "بزل الوريد بيُستخدم لسحب عيّنة دم."
  },
  {
    "word": "wound debridement",
    "ipa": "[wuːnd deɪˈbriːdmənt] (ووند دِبريدمِنت)",
    "meaning": "تنظيف الجرح من الأنسجة الميتة",
    "category": "procedures_extra",
    "exampleEn": "Debridement helps the wound heal faster.",
    "exampleAr": "تنظيف الجرح بيساعد يلتئم أسرع."
  },
  {
    "word": "tracheostomy",
    "ipa": "[ˌtreɪkiˈɒstəmi] (تريكي-أوستَمي)",
    "meaning": "فغر القصبة الهوائية",
    "category": "procedures_extra",
    "exampleEn": "A tracheostomy was performed to aid breathing.",
    "exampleAr": "اتعملت فغر قصبة هوائية عشان تساعد التنفس."
  },
  {
    "word": "pulse oximeter",
    "ipa": "[pʌls ɒkˈsɪmɪtər] (پَلس أوكسِمِتَر)",
    "meaning": "جهاز قياس تشبع الأكسجين",
    "category": "procedures_extra",
    "exampleEn": "Attach the pulse oximeter to his finger.",
    "exampleAr": "ركّب جهاز قياس الأكسجين على صباعه."
  },
  {
    "word": "hemostat",
    "ipa": "[ˈhiːməstæt] (هيمو-ستات)",
    "meaning": "ملقط وقف النزيف",
    "category": "procedures_extra",
    "exampleEn": "Use a hemostat to clamp the vessel.",
    "exampleAr": "استخدم ملقط عشان تشبك الوعاء الدموي."
  },
  {
    "word": "stretcher",
    "ipa": "[ˈstretʃər] (ستريتشَر)",
    "meaning": "النقّالة",
    "category": "procedures_extra",
    "exampleEn": "Transfer the patient onto the stretcher.",
    "exampleAr": "انقل المريض على النقّالة."
  },
  {
    "word": "walker",
    "ipa": "[ˈwɔːkər] (ووكَر)",
    "meaning": "إطار المشي",
    "category": "procedures_extra",
    "exampleEn": "The patient uses a walker after surgery.",
    "exampleAr": "المريض بيستخدم إطار مشي بعد العملية."
  },
  {
    "word": "code blue",
    "ipa": "[koʊd bluː] (كود بلو)",
    "meaning": "نداء طوارئ (سكتة قلبية)",
    "category": "procedures_extra",
    "exampleEn": "The staff responded immediately to the code blue.",
    "exampleAr": "الطاقم استجاب فورًا لنداء الطوارئ."
  },
  {
    "word": "Could you hold the line, please?",
    "ipa": "[kʊd juː hoʊld ðə laɪn pliːz] (كود يو هولد ذا لاين پليز)",
    "meaning": "ممكن تستنى على الخط لو سمحت؟",
    "category": "phone_communication",
    "exampleEn": "Could you hold the line while I check the file?",
    "exampleAr": "ممكن تستنى على الخط وأنا أراجع الملف؟"
  },
  {
    "word": "I'll transfer you to the doctor.",
    "ipa": "[aɪl ˈtrænsfər juː tuː ðə ˈdɒktər] (آيل ترانسفَر يو تو ذا دوكتَر)",
    "meaning": "هحوّلك للدكتور.",
    "category": "phone_communication",
    "exampleEn": "I'll transfer you to the doctor now.",
    "exampleAr": "هحوّلك للدكتور دلوقتي."
  },
  {
    "word": "Can I take a message?",
    "ipa": "[kæn aɪ teɪk ə ˈmesɪdʒ] (كان آي تيك أ مِسِج)",
    "meaning": "ممكن آخد رسالة؟",
    "category": "phone_communication",
    "exampleEn": "The doctor is busy, can I take a message?",
    "exampleAr": "الدكتور مشغول، ممكن آخد رسالة؟"
  },
  {
    "word": "appointment",
    "ipa": "[əˈpɔɪntmənt] (أپوينتمِنت)",
    "meaning": "الموعد",
    "category": "phone_communication",
    "exampleEn": "I'd like to book an appointment for Monday.",
    "exampleAr": "عايز أحجز موعد يوم الإتنين."
  },
  {
    "word": "specimen",
    "ipa": "[ˈspesɪmən] (سپِسِمِن)",
    "meaning": "العيّنة",
    "category": "lab_values",
    "exampleEn": "Please label the specimen clearly.",
    "exampleAr": "من فضلك علّم العيّنة بوضوح."
  },
  {
    "word": "urine sample",
    "ipa": "[ˈjʊrɪn ˈsæmpəl] (يورِن سامپِل)",
    "meaning": "عيّنة البول",
    "category": "lab_values",
    "exampleEn": "A urine sample is needed for the test.",
    "exampleAr": "محتاجين عيّنة بول للتحليل."
  },
  {
    "word": "stool sample",
    "ipa": "[stuːl ˈsæmpəl] (ستول سامپِل)",
    "meaning": "عيّنة البراز",
    "category": "lab_values",
    "exampleEn": "The lab requested a stool sample.",
    "exampleAr": "المعمل طلب عيّنة براز."
  },
  {
    "word": "cholesterol",
    "ipa": "[kəˈlestərɒl] (كولِستَرول)",
    "meaning": "الكوليسترول",
    "category": "lab_values",
    "exampleEn": "His cholesterol level is slightly high.",
    "exampleAr": "مستوى الكوليسترول عنده عالي شوية."
  },
  {
    "word": "hemoglobin",
    "ipa": "[ˈhiːməˌɡloʊbɪn] (هيمو-جلوبِن)",
    "meaning": "الهيموجلوبين",
    "category": "lab_values",
    "exampleEn": "Her hemoglobin level indicates anemia.",
    "exampleAr": "مستوى الهيموجلوبين عندها بيدل على فقر دم."
  },
  {
    "word": "white blood cell count",
    "ipa": "[waɪt blʌd sel kaʊnt] (وايت بلَد سِل كاونت)",
    "meaning": "عدد كرات الدم البيضاء",
    "category": "lab_values",
    "exampleEn": "The white blood cell count is elevated.",
    "exampleAr": "عدد كرات الدم البيضاء مرتفع."
  },
  {
    "word": "culture test",
    "ipa": "[ˈkʌltʃər test] (كَلتشَر تِست)",
    "meaning": "مزرعة (تحليل ميكروبيولوجي)",
    "category": "lab_values",
    "exampleEn": "A culture test will identify the bacteria.",
    "exampleAr": "المزرعة هتحدد نوع البكتيريا."
  },
  {
    "word": "arrhythmia",
    "ipa": "[əˈrɪðmiə] (أرِذميا)",
    "meaning": "اضطراب نظم القلب",
    "category": "cardiology",
    "exampleEn": "The monitor detected an arrhythmia.",
    "exampleAr": "الجهاز اكتشف اضطراب في نظم القلب."
  },
  {
    "word": "palpitations",
    "ipa": "[ˌpælpɪˈteɪʃənz] (پالپِتيشِنز)",
    "meaning": "خفقان القلب",
    "category": "cardiology",
    "exampleEn": "She complained of palpitations after coffee.",
    "exampleAr": "اشتكت من خفقان قلب بعد القهوة."
  },
  {
    "word": "murmur",
    "ipa": "[ˈmɜːrmər] (مِرمَر)",
    "meaning": "لغط قلبي",
    "category": "cardiology",
    "exampleEn": "The doctor heard a heart murmur.",
    "exampleAr": "الدكتور سمع لغط في القلب."
  },
  {
    "word": "angina",
    "ipa": "[ænˈdʒaɪnə] (أنجاينا)",
    "meaning": "الذبحة الصدرية",
    "category": "cardiology",
    "exampleEn": "He takes medication for angina.",
    "exampleAr": "بياخد دوا للذبحة الصدرية."
  },
  {
    "word": "myocardial infarction (MI)",
    "ipa": "[ˌmaɪoʊˈkɑːrdiəl ɪnˈfɑːrkʃən] (مايوكارديَل إنفاركشِن)",
    "meaning": "احتشاء عضلة القلب (أزمة قلبية)",
    "category": "cardiology",
    "exampleEn": "He was admitted with a myocardial infarction.",
    "exampleAr": "اتنقل للمستشفى بأزمة قلبية."
  },
  {
    "word": "defibrillator",
    "ipa": "[diːˈfɪbrɪleɪtər] (ديفِبريليتَر)",
    "meaning": "جهاز الصدمات الكهربائية",
    "category": "cardiology",
    "exampleEn": "Bring the defibrillator immediately.",
    "exampleAr": "هات جهاز الصدمات فورًا."
  },
  {
    "word": "pacemaker",
    "ipa": "[ˈpeɪsmeɪkər] (پيس-ميكَر)",
    "meaning": "منظم ضربات القلب",
    "category": "cardiology",
    "exampleEn": "He had a pacemaker fitted last year.",
    "exampleAr": "اترّكب له منظم ضربات قلب السنة اللي فاتت."
  },
  {
    "word": "cyanosis",
    "ipa": "[ˌsaɪəˈnoʊsɪs] (سايَنوسِس)",
    "meaning": "الزرقة (نقص أكسجين)",
    "category": "cardiology",
    "exampleEn": "Cyanosis of the lips was noted.",
    "exampleAr": "اتلوحظت زرقة في الشفايف."
  },
  {
    "word": "wheezing",
    "ipa": "[ˈwiːzɪŋ] (ويزينج)",
    "meaning": "الصفير التنفسي",
    "category": "respiratory",
    "exampleEn": "Wheezing was heard on auscultation.",
    "exampleAr": "اتسمع صفير تنفسي بالسماعة."
  },
  {
    "word": "sputum",
    "ipa": "[ˈspjuːtəm] (سپيوتَم)",
    "meaning": "البلغم",
    "category": "respiratory",
    "exampleEn": "The sputum sample was sent for culture.",
    "exampleAr": "عيّنة البلغم اتبعتت للمزرعة."
  },
  {
    "word": "bronchitis",
    "ipa": "[brɒŋˈkaɪtɪs] (برونكايتِس)",
    "meaning": "التهاب الشعب الهوائية",
    "category": "respiratory",
    "exampleEn": "He was diagnosed with acute bronchitis.",
    "exampleAr": "اتشخّص بالتهاب حاد في الشعب الهوائية."
  },
  {
    "word": "COPD",
    "ipa": "[siː oʊ piː diː] (سي-أو-پي-دي)",
    "meaning": "مرض الانسداد الرئوي المزمن",
    "category": "respiratory",
    "exampleEn": "COPD makes breathing difficult.",
    "exampleAr": "الانسداد الرئوي المزمن بيصعّب التنفس."
  },
  {
    "word": "nebulizer",
    "ipa": "[ˈnebjəlaɪzər] (نِبيولايزَر)",
    "meaning": "جهاز الاستنشاق البخاري",
    "category": "respiratory",
    "exampleEn": "Use the nebulizer twice a day.",
    "exampleAr": "استخدم جهاز الاستنشاق مرتين يوميًا."
  },
  {
    "word": "apnea",
    "ipa": "[ˈæpniə] (أپنيا)",
    "meaning": "انقطاع التنفس",
    "category": "respiratory",
    "exampleEn": "He suffers from sleep apnea.",
    "exampleAr": "بيعاني من انقطاع التنفس أثناء النوم."
  },
  {
    "word": "intubated",
    "ipa": "[ˈɪntjuːbeɪtɪd] (إنتيوبيتِد)",
    "meaning": "مُنبّب (بأنبوب تنفس)",
    "category": "respiratory",
    "exampleEn": "The patient remains intubated in the ICU.",
    "exampleAr": "المريض لسه منبّب في العناية المركزة."
  },
  {
    "word": "constipation",
    "ipa": "[ˌkɒnstɪˈpeɪʃən] (كونستِپيشِن)",
    "meaning": "الإمساك",
    "category": "gastrointestinal",
    "exampleEn": "She has been suffering from constipation.",
    "exampleAr": "بتعاني من إمساك."
  },
  {
    "word": "diarrhea",
    "ipa": "[ˌdaɪəˈriːə] (دايَريا)",
    "meaning": "الإسهال",
    "category": "gastrointestinal",
    "exampleEn": "The child had diarrhea for two days.",
    "exampleAr": "الطفل عنده إسهال من يومين."
  },
  {
    "word": "ulcer",
    "ipa": "[ˈʌlsər] (ألسَر)",
    "meaning": "القرحة",
    "category": "gastrointestinal",
    "exampleEn": "He has a stomach ulcer.",
    "exampleAr": "عنده قرحة في المعدة."
  },
  {
    "word": "appendicitis",
    "ipa": "[əˌpendɪˈsaɪtɪs] (أپِندِسايتِس)",
    "meaning": "التهاب الزائدة الدودية",
    "category": "gastrointestinal",
    "exampleEn": "He was operated on for appendicitis.",
    "exampleAr": "اتعمل له عملية للزائدة الدودية."
  },
  {
    "word": "bowel movement",
    "ipa": "[ˈbaʊəl ˈmuːvmənt] (باوَل موڤمِنت)",
    "meaning": "حركة الأمعاء (التبرز)",
    "category": "gastrointestinal",
    "exampleEn": "Has he had a bowel movement today?",
    "exampleAr": "حصلت له حركة أمعاء النهاردة؟"
  },
  {
    "word": "stomachache",
    "ipa": "[ˈstʌməkeɪk] (ستَمَك-إيك)",
    "meaning": "ألم المعدة",
    "category": "gastrointestinal",
    "exampleEn": "The child complained of a stomachache.",
    "exampleAr": "الطفل اشتكى من ألم في المعدة."
  },
  {
    "word": "jaundice",
    "ipa": "[ˈdʒɔːndɪs] (چوندِس)",
    "meaning": "اليرقان (اصفرار الجلد)",
    "category": "gastrointestinal",
    "exampleEn": "The newborn showed signs of jaundice.",
    "exampleAr": "المولود ظهرت عليه علامات يرقان."
  },
  {
    "word": "sprain",
    "ipa": "[spreɪn] (سپرين)",
    "meaning": "الالتواء",
    "category": "orthopedics",
    "exampleEn": "She has a sprained ankle.",
    "exampleAr": "عندها التواء في الكاحل."
  },
  {
    "word": "dislocation",
    "ipa": "[ˌdɪsloʊˈkeɪʃən] (دِسلوكيشِن)",
    "meaning": "الخلع",
    "category": "orthopedics",
    "exampleEn": "He suffered a shoulder dislocation.",
    "exampleAr": "حصله خلع في الكتف."
  },
  {
    "word": "arthritis",
    "ipa": "[ɑːrˈθraɪtɪs] (آرثرايتِس)",
    "meaning": "التهاب المفاصل",
    "category": "orthopedics",
    "exampleEn": "Arthritis affects her knees.",
    "exampleAr": "التهاب المفاصل بيأثر على ركبتيها."
  },
  {
    "word": "osteoporosis",
    "ipa": "[ˌɒstioʊpəˈroʊsɪs] (أوستيو-پوروسِس)",
    "meaning": "هشاشة العظام",
    "category": "orthopedics",
    "exampleEn": "Osteoporosis increases fracture risk.",
    "exampleAr": "هشاشة العظام بتزود خطر الكسور."
  },
  {
    "word": "physiotherapy",
    "ipa": "[ˌfɪzioʊˈθerəpi] (فيزيو-ثيرَپي)",
    "meaning": "العلاج الطبيعي",
    "category": "orthopedics",
    "exampleEn": "He attends physiotherapy twice a week.",
    "exampleAr": "بيروح علاج طبيعي مرتين أسبوعيًا."
  },
  {
    "word": "crutches",
    "ipa": "[ˈkrʌtʃɪz] (كرَتشِز)",
    "meaning": "عكاكيز",
    "category": "orthopedics",
    "exampleEn": "He needs crutches to walk after surgery.",
    "exampleAr": "محتاج عكاكيز عشان يمشي بعد العملية."
  },
  {
    "word": "eczema",
    "ipa": "[ˈeksɪmə] (إكسِمَة)",
    "meaning": "الأكزيما",
    "category": "dermatology",
    "exampleEn": "The cream helps relieve eczema symptoms.",
    "exampleAr": "الكريم بيساعد يخفف أعراض الأكزيما."
  },
  {
    "word": "itching",
    "ipa": "[ˈɪtʃɪŋ] (إتشِنج)",
    "meaning": "الحكة",
    "category": "dermatology",
    "exampleEn": "He complains of itching on his arms.",
    "exampleAr": "بيشتكي من حكة في دراعيه."
  },
  {
    "word": "blister",
    "ipa": "[ˈblɪstər] (بلِستَر)",
    "meaning": "الفقاعة الجلدية",
    "category": "dermatology",
    "exampleEn": "A blister formed after the burn.",
    "exampleAr": "فقاعة اتكوّنت بعد الحرق."
  },
  {
    "word": "scar",
    "ipa": "[skɑːr] (سكار)",
    "meaning": "الندبة",
    "category": "dermatology",
    "exampleEn": "The surgery left a small scar.",
    "exampleAr": "العملية سابت ندبة صغيرة."
  },
  {
    "word": "burn",
    "ipa": "[bɜːrn] (بِرن)",
    "meaning": "الحرق",
    "category": "dermatology",
    "exampleEn": "He suffered a second-degree burn.",
    "exampleAr": "أصيب بحرق من الدرجة التانية."
  },
  {
    "word": "blurred vision",
    "ipa": "[blɜːrd ˈvɪʒən] (بلِرد ڤيچِن)",
    "meaning": "تشوش الرؤية",
    "category": "ent_ophthalmology",
    "exampleEn": "She reported blurred vision this morning.",
    "exampleAr": "أبلغت عن تشوش رؤية الصبح."
  },
  {
    "word": "earache",
    "ipa": "[ˈɪəreɪk] (إيَر-إيك)",
    "meaning": "ألم الأذن",
    "category": "ent_ophthalmology",
    "exampleEn": "The child has an earache and fever.",
    "exampleAr": "الطفل عنده ألم أذن وسخونية."
  },
  {
    "word": "sore throat",
    "ipa": "[sɔːr θroʊt] (سور ثروت)",
    "meaning": "التهاب الحلق",
    "category": "ent_ophthalmology",
    "exampleEn": "He has a sore throat and cough.",
    "exampleAr": "عنده التهاب حلق وكحة."
  },
  {
    "word": "nasal congestion",
    "ipa": "[ˈneɪzəl kənˈdʒestʃən] (نيزَل كونجِستشِن)",
    "meaning": "احتقان الأنف",
    "category": "ent_ophthalmology",
    "exampleEn": "Nasal congestion is common with a cold.",
    "exampleAr": "احتقان الأنف شائع مع البرد."
  },
  {
    "word": "hearing aid",
    "ipa": "[ˈhɪərɪŋ eɪd] (هيرِنج إيد)",
    "meaning": "سماعة الأذن الطبية",
    "category": "ent_ophthalmology",
    "exampleEn": "He wears a hearing aid in both ears.",
    "exampleAr": "بيلبس سماعة أذن في الاتنين."
  },
  {
    "word": "thyroid",
    "ipa": "[ˈθaɪrɔɪd] (ثايرويد)",
    "meaning": "الغدة الدرقية",
    "category": "endocrine_general",
    "exampleEn": "Her thyroid levels were checked.",
    "exampleAr": "مستوى الغدة الدرقية اتفحص."
  },
  {
    "word": "metabolism",
    "ipa": "[məˈtæbəlɪzəm] (مِتابَلِزَم)",
    "meaning": "الأيض",
    "category": "endocrine_general",
    "exampleEn": "A slow metabolism can lead to weight gain.",
    "exampleAr": "الأيض البطيء ممكن يؤدي لزيادة وزن."
  },
  {
    "word": "hormone",
    "ipa": "[ˈhɔːrmoʊn] (هورمون)",
    "meaning": "الهرمون",
    "category": "endocrine_general",
    "exampleEn": "Hormone levels fluctuate during pregnancy.",
    "exampleAr": "مستويات الهرمونات بتتغيّر أثناء الحمل."
  },
  {
    "word": "Take your medication as prescribed.",
    "ipa": "[teɪk jʊər ˌmedɪˈkeɪʃən æz prɪˈskraɪbd] (تيك يور مِدِكيشِن از پرِسكرايبد)",
    "meaning": "خد دواءك زي ما اتوصف.",
    "category": "discharge_instructions",
    "exampleEn": "Take your medication as prescribed by the doctor.",
    "exampleAr": "خد دواءك زي ما الدكتور وصف."
  },
  {
    "word": "Rest and avoid heavy lifting.",
    "ipa": "[rest ænd əˈvɔɪd ˈhevi ˈlɪftɪŋ] (رِست آند أفويد هِڤي لِفتينج)",
    "meaning": "ارتاح وتجنّب رفع حاجات تقيلة.",
    "category": "discharge_instructions",
    "exampleEn": "Rest and avoid heavy lifting for two weeks.",
    "exampleAr": "ارتاح وتجنّب رفع حاجات تقيلة لمدة أسبوعين."
  },
  {
    "word": "Keep the wound clean and dry.",
    "ipa": "[kiːp ðə wuːnd kliːn ænd draɪ] (كيپ ذا ووند كلين آند دراي)",
    "meaning": "خلّي الجرح نضيف وجاف.",
    "category": "discharge_instructions",
    "exampleEn": "Keep the wound clean and dry until it heals.",
    "exampleAr": "خلّي الجرح نضيف وجاف لحد ما يلتئم."
  },
  {
    "word": "Return if symptoms worsen.",
    "ipa": "[rɪˈtɜːrn ɪf ˈsɪmptəmz ˈwɜːrsən] (رِتِرن إف سِمپتَمز وِرسِن)",
    "meaning": "ارجع لو الأعراض ساءت.",
    "category": "discharge_instructions",
    "exampleEn": "Return to the hospital if symptoms worsen.",
    "exampleAr": "ارجع للمستشفى لو الأعراض ساءت."
  },
  {
    "word": "Drink plenty of fluids.",
    "ipa": "[drɪŋk ˈplenti əv ˈfluːɪdz] (درِنك پلِنتي أوف فلويدز)",
    "meaning": "اشرب سوائل كتير.",
    "category": "discharge_instructions",
    "exampleEn": "Drink plenty of fluids to stay hydrated.",
    "exampleAr": "اشرب سوائل كتير عشان تفضل مرطب."
  },
  {
    "word": "chemotherapy",
    "ipa": "[ˌkiːmoʊˈθerəpi] (كيمو-ثيرَپي)",
    "meaning": "العلاج الكيماوي",
    "category": "oncology",
    "exampleEn": "She started chemotherapy last week.",
    "exampleAr": "بدأت علاج كيماوي الأسبوع اللي فات."
  },
  {
    "word": "radiotherapy",
    "ipa": "[ˌreɪdioʊˈθerəpi] (ريديو-ثيرَپي)",
    "meaning": "العلاج الإشعاعي",
    "category": "oncology",
    "exampleEn": "Radiotherapy sessions are scheduled weekly.",
    "exampleAr": "جلسات العلاج الإشعاعي مجدولة أسبوعيًا."
  },
  {
    "word": "remission",
    "ipa": "[rɪˈmɪʃən] (رِمِشِن)",
    "meaning": "الهدأة (تراجع المرض)",
    "category": "oncology",
    "exampleEn": "The cancer is now in remission.",
    "exampleAr": "السرطان دلوقتي في مرحلة الهدأة."
  },
  {
    "word": "metastasis",
    "ipa": "[məˈtæstəsɪs] (مِتاستَسِس)",
    "meaning": "الانتشار الورمي",
    "category": "oncology",
    "exampleEn": "The scan showed no metastasis.",
    "exampleAr": "الأشعة مفيهاش انتشار ورمي."
  },
  {
    "word": "oncologist",
    "ipa": "[ɒŋˈkɒlədʒɪst] (أونكولوجِست)",
    "meaning": "طبيب الأورام",
    "category": "oncology",
    "exampleEn": "She was referred to an oncologist.",
    "exampleAr": "اتحوّلت لطبيب أورام."
  },
  {
    "word": "hair loss",
    "ipa": "[her lɒs] (هير لوس)",
    "meaning": "تساقط الشعر",
    "category": "oncology",
    "exampleEn": "Hair loss is a common side effect of chemotherapy.",
    "exampleAr": "تساقط الشعر عرض جانبي شائع للعلاج الكيماوي."
  },
  {
    "word": "surgeon",
    "ipa": "[ˈsɜːrdʒən] (سِرجَن)",
    "meaning": "الجرّاح",
    "category": "surgery",
    "exampleEn": "The surgeon explained the procedure.",
    "exampleAr": "الجرّاح شرح الإجراء."
  },
  {
    "word": "incision",
    "ipa": "[ɪnˈsɪʒən] (إنسِچِن)",
    "meaning": "الشق الجراحي",
    "category": "surgery",
    "exampleEn": "The incision is healing well.",
    "exampleAr": "الشق الجراحي بيلتئم كويس."
  },
  {
    "word": "general anesthesia",
    "ipa": "[ˈdʒenərəl ˌænəsˈθiːʒə] (چِنَرَل أنِسثيچا)",
    "meaning": "التخدير الكلي",
    "category": "surgery",
    "exampleEn": "He was placed under general anesthesia.",
    "exampleAr": "اتخدّر تخدير كلي."
  },
  {
    "word": "local anesthesia",
    "ipa": "[ˈloʊkəl ˌænəsˈθiːʒə] (لوكَل أنِسثيچا)",
    "meaning": "التخدير الموضعي",
    "category": "surgery",
    "exampleEn": "Local anesthesia was used for the stitches.",
    "exampleAr": "استُخدم تخدير موضعي للغرز."
  },
  {
    "word": "recovery room",
    "ipa": "[rɪˈkʌvəri ruːm] (رِكَڤَري روم)",
    "meaning": "غرفة الإفاقة",
    "category": "surgery",
    "exampleEn": "He is resting in the recovery room.",
    "exampleAr": "بيرتاح في غرفة الإفاقة."
  },
  {
    "word": "scrub nurse",
    "ipa": "[skrʌb nɜːrs] (سكرَب نِرس)",
    "meaning": "الممرض المعقّم بغرفة العمليات",
    "category": "surgery",
    "exampleEn": "The scrub nurse handed the surgeon the instrument.",
    "exampleAr": "الممرض المعقّم ناول الجرّاح الأداة."
  },
  {
    "word": "sterilization",
    "ipa": "[ˌsterəlaɪˈzeɪʃən] (ستيرِلايزيشِن)",
    "meaning": "التعقيم",
    "category": "surgery",
    "exampleEn": "All instruments require sterilization.",
    "exampleAr": "كل الأدوات محتاجة تعقيم."
  },
  {
    "word": "drain",
    "ipa": "[dreɪn] (درين)",
    "meaning": "أنبوب التصريف",
    "category": "surgery",
    "exampleEn": "The surgical drain will be removed tomorrow.",
    "exampleAr": "أنبوب التصريف الجراحي هيتشال بكرة."
  },
  {
    "word": "balanced diet",
    "ipa": "[ˈbælənst ˈdaɪət] (بالانست دايَت)",
    "meaning": "النظام الغذائي المتوازن",
    "category": "nutrition_diet",
    "exampleEn": "A balanced diet supports recovery.",
    "exampleAr": "النظام الغذائي المتوازن بيدعم التعافي."
  },
  {
    "word": "appetite",
    "ipa": "[ˈæpɪtaɪt] (أپِتايت)",
    "meaning": "الشهية",
    "category": "nutrition_diet",
    "exampleEn": "His appetite has improved this week.",
    "exampleAr": "شهيته اتحسّنت الأسبوع ده."
  },
  {
    "word": "fluid intake",
    "ipa": "[ˈfluːɪd ˈɪnteɪk] (فلويد إنتيك)",
    "meaning": "كمية السوائل المتناولة",
    "category": "nutrition_diet",
    "exampleEn": "Monitor his fluid intake closely.",
    "exampleAr": "راقب كمية السوائل اللي بياخدها عن قرب."
  },
  {
    "word": "supplement",
    "ipa": "[ˈsʌplɪmənt] (سَپلِمِنت)",
    "meaning": "المكمّل الغذائي",
    "category": "nutrition_diet",
    "exampleEn": "The doctor prescribed an iron supplement.",
    "exampleAr": "الدكتور وصف مكمّل حديد."
  },
  {
    "word": "feeding tube",
    "ipa": "[ˈfiːdɪŋ tuːb] (فيدِنج تيوب)",
    "meaning": "أنبوب التغذية",
    "category": "nutrition_diet",
    "exampleEn": "He is fed through a feeding tube.",
    "exampleAr": "بيتغذى عن طريق أنبوب تغذية."
  },
  {
    "word": "swallowing difficulty",
    "ipa": "[ˈswɒloʊɪŋ ˈdɪfɪkəlti] (سوالوينج دِفِكَلتي)",
    "meaning": "صعوبة البلع",
    "category": "nutrition_diet",
    "exampleEn": "She has swallowing difficulty after the stroke.",
    "exampleAr": "عندها صعوبة بلع بعد السكتة الدماغية."
  },
  {
    "word": "supine position",
    "ipa": "[ˈsuːpaɪn pəˈzɪʃən] (سوپاين پوزِشِن)",
    "meaning": "وضعية الاستلقاء على الظهر",
    "category": "mobility_positions",
    "exampleEn": "Place the patient in a supine position.",
    "exampleAr": "حط المريض في وضعية الاستلقاء على الظهر."
  },
  {
    "word": "prone position",
    "ipa": "[proʊn pəˈzɪʃən] (پرون پوزِشِن)",
    "meaning": "وضعية الاستلقاء على البطن",
    "category": "mobility_positions",
    "exampleEn": "The prone position can help with breathing.",
    "exampleAr": "وضعية البطن ممكن تساعد في التنفس."
  },
  {
    "word": "bedridden",
    "ipa": "[ˈbedrɪdən] (بِد-رِدِن)",
    "meaning": "طريح الفراش",
    "category": "mobility_positions",
    "exampleEn": "The patient has been bedridden for a month.",
    "exampleAr": "المريض طريح الفراش من شهر."
  },
  {
    "word": "ambulate",
    "ipa": "[ˈæmbjəleɪt] (امبيوليت)",
    "meaning": "يتحرك ماشيًا",
    "category": "mobility_positions",
    "exampleEn": "Encourage him to ambulate after surgery.",
    "exampleAr": "شجّعه يمشي بعد العملية."
  },
  {
    "word": "transfer (patient)",
    "ipa": "[ˈtrænsfɜːr] (ترانسفِر)",
    "meaning": "نقل المريض (من سرير لكرسي مثلًا)",
    "category": "mobility_positions",
    "exampleEn": "Assist with the patient transfer carefully.",
    "exampleAr": "ساعد في نقل المريض بحرص."
  },
  {
    "word": "fall risk",
    "ipa": "[fɔːl rɪsk] (فول رِسك)",
    "meaning": "خطر السقوط",
    "category": "mobility_positions",
    "exampleEn": "He is on the fall risk list.",
    "exampleAr": "هو مسجل على قائمة خطر السقوط."
  },
  {
    "word": "baseline observations",
    "ipa": "[ˈbeɪslaɪn ˌɒbzərˈveɪʃənz] (بيسلاين أوبزِرڤيشِنز)",
    "meaning": "القياسات الأساسية الأولى",
    "category": "documentation_extra",
    "exampleEn": "Record baseline observations on admission.",
    "exampleAr": "سجّل القياسات الأساسية وقت الدخول."
  },
  {
    "word": "chart",
    "ipa": "[tʃɑːrt] (تشارت)",
    "meaning": "ملف/سجل المريض",
    "category": "documentation_extra",
    "exampleEn": "Update the chart after every visit.",
    "exampleAr": "حدّث السجل بعد كل زيارة."
  },
  {
    "word": "handwritten note",
    "ipa": "[ˈhændrɪtən noʊt] (هاند-رِتِن نوت)",
    "meaning": "ملاحظة مكتوبة بخط اليد",
    "category": "documentation_extra",
    "exampleEn": "Add a handwritten note if the system is down.",
    "exampleAr": "ضيف ملاحظة بخط اليد لو النظام واقع."
  },
  {
    "word": "incident report",
    "ipa": "[ˈɪnsɪdənt rɪˈpɔːrt] (إنسِدِنت رِپورت)",
    "meaning": "تقرير الحادثة",
    "category": "documentation_extra",
    "exampleEn": "File an incident report for the fall.",
    "exampleAr": "قدّم تقرير حادثة عن السقوط."
  },
  {
    "word": "informed of risks",
    "ipa": "[ɪnˈfɔːrmd əv rɪsks] (إنفورمد أوف رِسكس)",
    "meaning": "تم إبلاغه بالمخاطر",
    "category": "documentation_extra",
    "exampleEn": "The patient was informed of the risks.",
    "exampleAr": "المريض اتبلّغ بالمخاطر."
  },
  {
    "word": "self-care",
    "ipa": "[self ker] (سِلف-كير)",
    "meaning": "الرعاية الذاتية",
    "category": "patient_education",
    "exampleEn": "Self-care is important for diabetics.",
    "exampleAr": "الرعاية الذاتية مهمة لمرضى السكري."
  },
  {
    "word": "compliance (with treatment)",
    "ipa": "[kəmˈplaɪəns] (كومپلايَنس)",
    "meaning": "الالتزام بالعلاج",
    "category": "patient_education",
    "exampleEn": "Good compliance improves outcomes.",
    "exampleAr": "الالتزام الجيد بيحسّن النتائج."
  },
  {
    "word": "lifestyle changes",
    "ipa": "[ˈlaɪfstaɪl tʃeɪndʒɪz] (لايف-ستايل تشينجِز)",
    "meaning": "تغييرات نمط الحياة",
    "category": "patient_education",
    "exampleEn": "Lifestyle changes can lower blood pressure.",
    "exampleAr": "تغييرات نمط الحياة ممكن تقلل ضغط الدم."
  },
  {
    "word": "health literacy",
    "ipa": "[helθ ˈlɪtərəsi] (هِلث لِترَسي)",
    "meaning": "الوعي الصحي",
    "category": "patient_education",
    "exampleEn": "We aim to improve patient health literacy.",
    "exampleAr": "بنهدف نحسّن الوعي الصحي للمريض."
  },
  {
    "word": "warning signs",
    "ipa": "[ˈwɔːrnɪŋ saɪnz] (وورنِنج ساينز)",
    "meaning": "علامات التحذير",
    "category": "patient_education",
    "exampleEn": "Know the warning signs of a stroke.",
    "exampleAr": "اعرف علامات التحذير من السكتة الدماغية."
  },
  {
    "word": "to observe",
    "ipa": "[əbˈzɜːrv] (أبزِرڤ)",
    "meaning": "يلاحظ",
    "category": "common_verbs",
    "exampleEn": "Observe the patient for any changes.",
    "exampleAr": "لاحظ المريض لأي تغييرات."
  },
  {
    "word": "to escort",
    "ipa": "[ɪˈskɔːrt] (إسكورت)",
    "meaning": "يرافق (المريض)",
    "category": "common_verbs",
    "exampleEn": "Escort the patient to radiology.",
    "exampleAr": "رافق المريض لقسم الأشعة."
  },
  {
    "word": "to reposition",
    "ipa": "[ˌriːpəˈzɪʃən] (ري-پوزِشِن)",
    "meaning": "يغيّر وضعية المريض",
    "category": "common_verbs",
    "exampleEn": "Reposition the patient every two hours.",
    "exampleAr": "غيّر وضعية المريض كل ساعتين."
  },
  {
    "word": "to hydrate",
    "ipa": "[ˈhaɪdreɪt] (هايدريت)",
    "meaning": "يرطّب/يعطي سوائل",
    "category": "common_verbs",
    "exampleEn": "Hydrate the patient before the procedure.",
    "exampleAr": "رطّب المريض قبل الإجراء."
  },
  {
    "word": "to notify",
    "ipa": "[ˈnoʊtɪfaɪ] (نوتِفاي)",
    "meaning": "يُبلّغ",
    "category": "common_verbs",
    "exampleEn": "Notify the doctor of any changes.",
    "exampleAr": "بلّغ الدكتور بأي تغييرات."
  },
  {
    "word": "to stabilize",
    "ipa": "[ˈsteɪbəlaɪz] (ستيبَلايز)",
    "meaning": "يستقر/يثبّت الحالة",
    "category": "common_verbs",
    "exampleEn": "The team worked to stabilize the patient.",
    "exampleAr": "الفريق شغل عشان يثبّت حالة المريض."
  },
  {
    "word": "to palpate",
    "ipa": "[ˈpælpeɪt] (پالپيت)",
    "meaning": "يفحص باللمس",
    "category": "common_verbs",
    "exampleEn": "Palpate the abdomen gently.",
    "exampleAr": "افحص البطن باللمس بلطف."
  },
  {
    "word": "to auscultate",
    "ipa": "[ˈɔːskəlteɪt] (أوسكَلتيت)",
    "meaning": "يستمع بالسماعة",
    "category": "common_verbs",
    "exampleEn": "Auscultate the lungs before discharge.",
    "exampleAr": "استمع للرئتين بالسماعة قبل الخروج."
  },
  {
    "word": "to irrigate",
    "ipa": "[ˈɪrɪɡeɪt] (إرِجيت)",
    "meaning": "يغسل/يروي (جرح مثلًا)",
    "category": "common_verbs",
    "exampleEn": "Irrigate the wound with saline.",
    "exampleAr": "اغسل الجرح بمحلول ملحي."
  },
  {
    "word": "to titrate",
    "ipa": "[ˈtaɪtreɪt] (تايتريت)",
    "meaning": "يعدّل الجرعة تدريجيًا",
    "category": "common_verbs",
    "exampleEn": "Titrate the medication based on response.",
    "exampleAr": "عدّل الجرعة تدريجيًا حسب استجابة المريض."
  },
  {
    "word": "stable",
    "ipa": "[ˈsteɪbəl] (ستيبِل)",
    "meaning": "مستقر",
    "category": "descriptive_conditions",
    "exampleEn": "His condition is now stable.",
    "exampleAr": "حالته دلوقتي مستقرة."
  },
  {
    "word": "critical",
    "ipa": "[ˈkrɪtɪkəl] (كرِتِكَل)",
    "meaning": "حرج/خطير",
    "category": "descriptive_conditions",
    "exampleEn": "She is in critical condition.",
    "exampleAr": "هي في حالة حرجة."
  },
  {
    "word": "responsive",
    "ipa": "[rɪˈspɒnsɪv] (رِسپونسِڤ)",
    "meaning": "مستجيب/واعي",
    "category": "descriptive_conditions",
    "exampleEn": "The patient is responsive to voice.",
    "exampleAr": "المريض بيستجيب للصوت."
  },
  {
    "word": "alert and oriented",
    "ipa": "[əˈlɜːrt ænd ˈɔːrienti d] (ألِرت آند أورينتِد)",
    "meaning": "واعي ومدرك (للزمان والمكان)",
    "category": "descriptive_conditions",
    "exampleEn": "The patient is alert and oriented.",
    "exampleAr": "المريض واعي ومدرك."
  },
  {
    "word": "lethargic",
    "ipa": "[ləˈθɑːrdʒɪk] (لِثارجِك)",
    "meaning": "خامل/فاتر",
    "category": "descriptive_conditions",
    "exampleEn": "He appears lethargic today.",
    "exampleAr": "بيبدو خامل النهاردة."
  },
  {
    "word": "agitated",
    "ipa": "[ˈædʒɪteɪtɪd] (أجِتيتِد)",
    "meaning": "مهتاج/متوتر",
    "category": "descriptive_conditions",
    "exampleEn": "The patient became agitated at night.",
    "exampleAr": "المريض بقى مهتاج بالليل."
  },
  {
    "word": "comfortable",
    "ipa": "[ˈkʌmftəbəl] (كَمفتَبِل)",
    "meaning": "مرتاح",
    "category": "descriptive_conditions",
    "exampleEn": "She says she feels comfortable now.",
    "exampleAr": "بتقول إنها حاسة بارتياح دلوقتي."
  },
  {
    "word": "WNL",
    "ipa": "[ˌdʌbəljuː en ˈel] (دَبِليو-إن-إل)",
    "meaning": "ضمن الحدود الطبيعية (Within Normal Limits)",
    "category": "abbreviations_extra",
    "exampleEn": "All lab results are WNL.",
    "exampleAr": "كل نتائج التحاليل ضمن الحدود الطبيعية."
  },
  {
    "word": "ROM",
    "ipa": "[ˌɑːr oʊ ˈem] (آر-أو-إم)",
    "meaning": "مدى الحركة (Range of Motion)",
    "category": "abbreviations_extra",
    "exampleEn": "Check the ROM of the injured knee.",
    "exampleAr": "افحص مدى حركة الركبة المصابة."
  },
  {
    "word": "VS",
    "ipa": "[ˌviː ˈes] (ڤي-إس)",
    "meaning": "العلامات الحيوية (Vital Signs)",
    "category": "abbreviations_extra",
    "exampleEn": "Record the VS every four hours.",
    "exampleAr": "سجّل العلامات الحيوية كل 4 ساعات."
  },
  {
    "word": "Dx",
    "ipa": "[ˌdiː ˈeks] (دي-إكس)",
    "meaning": "التشخيص (Diagnosis)",
    "category": "abbreviations_extra",
    "exampleEn": "The Dx was confirmed by biopsy.",
    "exampleAr": "التشخيص اتأكد بالخزعة."
  },
  {
    "word": "Tx",
    "ipa": "[ˌtiː ˈeks] (تي-إكس)",
    "meaning": "العلاج (Treatment)",
    "category": "abbreviations_extra",
    "exampleEn": "The Tx plan includes physiotherapy.",
    "exampleAr": "خطة العلاج بتشمل علاج طبيعي."
  },
  {
    "word": "Hx",
    "ipa": "[ˌeɪtʃ ˈeks] (إيتش-إكس)",
    "meaning": "التاريخ المرضي (History)",
    "category": "abbreviations_extra",
    "exampleEn": "Take a full Hx from the patient.",
    "exampleAr": "خد تاريخ مرضي كامل من المريض."
  },
  {
    "word": "Sx",
    "ipa": "[ˌes ˈeks] (إس-إكس)",
    "meaning": "الأعراض (Symptoms)",
    "category": "abbreviations_extra",
    "exampleEn": "List all Sx reported by the patient.",
    "exampleAr": "اكتب كل الأعراض اللي المريض ذكرها."
  },
  {
    "word": "urinary tract infection (UTI)",
    "ipa": "[ˈjʊrɪneri trækt ɪnˈfekʃən] (يورِنَري تراكت إنفِكشِن)",
    "meaning": "التهاب المسالك البولية",
    "category": "renal_urology",
    "exampleEn": "She was treated for a urinary tract infection.",
    "exampleAr": "اتعالجت من التهاب المسالك البولية."
  },
  {
    "word": "kidney stone",
    "ipa": "[ˈkɪdni stoʊn] (كِدني ستون)",
    "meaning": "حصوة الكلى",
    "category": "renal_urology",
    "exampleEn": "He was admitted with a kidney stone.",
    "exampleAr": "اتنقل للمستشفى بحصوة كلى."
  },
  {
    "word": "urinate",
    "ipa": "[ˈjʊrɪneɪt] (يورِنيت)",
    "meaning": "يتبول",
    "category": "renal_urology",
    "exampleEn": "He was unable to urinate normally.",
    "exampleAr": "مقدرش يتبول بشكل طبيعي."
  },
  {
    "word": "renal failure",
    "ipa": "[ˈriːnəl ˈfeɪljər] (رينَل فيلير)",
    "meaning": "الفشل الكلوي",
    "category": "renal_urology",
    "exampleEn": "He is being treated for renal failure.",
    "exampleAr": "بيتعالج من فشل كلوي."
  },
  {
    "word": "urinary catheter",
    "ipa": "[ˈjʊrɪneri ˈkæθətər] (يورِنَري كاثِتَر)",
    "meaning": "قسطرة بولية",
    "category": "renal_urology",
    "exampleEn": "A urinary catheter was inserted.",
    "exampleAr": "اتركّبت قسطرة بولية."
  },
  {
    "word": "blood glucose meter",
    "ipa": "[blʌd ˈɡluːkoʊs ˈmiːtər] (بلَد جلوكوس ميتَر)",
    "meaning": "جهاز قياس السكر",
    "category": "diabetes_management",
    "exampleEn": "Use the blood glucose meter before meals.",
    "exampleAr": "استخدم جهاز قياس السكر قبل الأكل."
  },
  {
    "word": "insulin pen",
    "ipa": "[ˈɪnsəlɪn pen] (إنسولِن پِن)",
    "meaning": "قلم الأنسولين",
    "category": "diabetes_management",
    "exampleEn": "He injects insulin using an insulin pen.",
    "exampleAr": "بياخد أنسولين باستخدام قلم الأنسولين."
  },
  {
    "word": "diabetic foot care",
    "ipa": "[ˌdaɪəˈbetɪk fʊt ker] (دايابِتِك فوت كير)",
    "meaning": "العناية بقدم مريض السكري",
    "category": "diabetes_management",
    "exampleEn": "Diabetic foot care prevents complications.",
    "exampleAr": "العناية بقدم مريض السكري بتمنع المضاعفات."
  },
  {
    "word": "A1C test",
    "ipa": "[eɪ wʌn siː test] (إي-وَن-سي تِست)",
    "meaning": "تحليل السكر التراكمي",
    "category": "diabetes_management",
    "exampleEn": "The A1C test shows average blood sugar.",
    "exampleAr": "تحليل السكر التراكمي بيوضح متوسط السكر."
  },
  {
    "word": "anaphylaxis",
    "ipa": "[ˌænəfəˈlæksɪs] (أنافِلاكسِس)",
    "meaning": "الصدمة التحسسية",
    "category": "allergy_immunology",
    "exampleEn": "He went into anaphylaxis after the sting.",
    "exampleAr": "دخل في صدمة تحسسية بعد اللدغة."
  },
  {
    "word": "epinephrine (EpiPen)",
    "ipa": "[ˌepɪˈnefrɪn] (إپِنِفرِن)",
    "meaning": "الإبينفرين (لعلاج الحساسية الشديدة)",
    "category": "allergy_immunology",
    "exampleEn": "Administer epinephrine immediately.",
    "exampleAr": "أعطي الإبينفرين فورًا."
  },
  {
    "word": "hives",
    "ipa": "[haɪvz] (هايڤز)",
    "meaning": "الشرى (طفح تحسسي)",
    "category": "allergy_immunology",
    "exampleEn": "She developed hives after taking the drug.",
    "exampleAr": "ظهرلها شرى بعد ما اخدت الدواء."
  },
  {
    "word": "immune system",
    "ipa": "[ɪˈmjuːn ˈsɪstəm] (إميون سِستَم)",
    "meaning": "الجهاز المناعي",
    "category": "allergy_immunology",
    "exampleEn": "A weak immune system increases infection risk.",
    "exampleAr": "الجهاز المناعي الضعيف بيزود خطر العدوى."
  },
  {
    "word": "bed rail",
    "ipa": "[bed reɪl] (بِد ريل)",
    "meaning": "حاجز السرير",
    "category": "equipment_extra",
    "exampleEn": "Keep the bed rail up for safety.",
    "exampleAr": "خلّي حاجز السرير مرفوع للأمان."
  },
  {
    "word": "suction machine",
    "ipa": "[ˈsʌkʃən məˈʃiːn] (سَكشِن مَشين)",
    "meaning": "جهاز الشفط",
    "category": "equipment_extra",
    "exampleEn": "Use the suction machine to clear the airway.",
    "exampleAr": "استخدم جهاز الشفط عشان تنظّف مجرى التنفس."
  },
  {
    "word": "infusion pump",
    "ipa": "[ɪnˈfjuːʒən pʌmp] (إنفيوچِن پَمپ)",
    "meaning": "مضخة التسريب",
    "category": "equipment_extra",
    "exampleEn": "The infusion pump controls the IV rate.",
    "exampleAr": "مضخة التسريب بتتحكم في معدل السائل الوريدي."
  },
  {
    "word": "blood pressure cuff",
    "ipa": "[blʌd ˈpreʃər kʌf] (بلَد پريشَر كَف)",
    "meaning": "كُم قياس ضغط الدم",
    "category": "equipment_extra",
    "exampleEn": "Wrap the blood pressure cuff around his arm.",
    "exampleAr": "لف كُم قياس الضغط حوالين دراعه."
  },
  {
    "word": "gown",
    "ipa": "[ɡaʊn] (جاون)",
    "meaning": "الرداء الطبي",
    "category": "equipment_extra",
    "exampleEn": "Please put on a hospital gown.",
    "exampleAr": "من فضلك البس رداء المستشفى."
  },
  {
    "word": "mask",
    "ipa": "[mæsk] (ماسك)",
    "meaning": "الكمّامة",
    "category": "equipment_extra",
    "exampleEn": "Wear a mask when entering the room.",
    "exampleAr": "البس كمّامة لما تدخل الأوضة."
  },
  {
    "word": "apron",
    "ipa": "[ˈeɪprən] (إيپرَن)",
    "meaning": "المريلة الواقية",
    "category": "equipment_extra",
    "exampleEn": "Wear an apron during the procedure.",
    "exampleAr": "البس مريلة واقية أثناء الإجراء."
  },
  {
    "word": "shift",
    "ipa": "[ʃɪft] (شِفت)",
    "meaning": "الوردية/الشيفت",
    "category": "admin_extra",
    "exampleEn": "She is working the night shift.",
    "exampleAr": "بتشتغل شيفت الليل."
  },
  {
    "word": "staff meeting",
    "ipa": "[stæf ˈmiːtɪŋ] (ستاف ميتِنج)",
    "meaning": "اجتماع الطاقم",
    "category": "admin_extra",
    "exampleEn": "There is a staff meeting at 9 AM.",
    "exampleAr": "فيه اجتماع طاقم الساعة 9 الصبح."
  },
  {
    "word": "workload",
    "ipa": "[ˈwɜːrkloʊd] (وِرك-لود)",
    "meaning": "عبء العمل",
    "category": "admin_extra",
    "exampleEn": "The workload increased during the flu season.",
    "exampleAr": "عبء العمل زاد وقت موسم الإنفلونزا."
  },
  {
    "word": "supervisor",
    "ipa": "[ˈsuːpərvaɪzər] (سوپَرڤايزَر)",
    "meaning": "المشرف",
    "category": "admin_extra",
    "exampleEn": "Report any issues to your supervisor.",
    "exampleAr": "بلّغ المشرف بأي مشاكل."
  },
  {
    "word": "policy",
    "ipa": "[ˈpɒləsi] (پوليسي)",
    "meaning": "السياسة/اللائحة",
    "category": "admin_extra",
    "exampleEn": "Follow hospital policy at all times.",
    "exampleAr": "اتّبع لائحة المستشفى دايمًا."
  },
  {
    "word": "scope of care",
    "ipa": "[skoʊp əv ker] (سكوپ أوف كير)",
    "meaning": "نطاق الرعاية",
    "category": "nclex_general",
    "exampleEn": "This falls within the scope of care.",
    "exampleAr": "ده جوّه نطاق الرعاية."
  },
  {
    "word": "qualified",
    "ipa": "[ˈkwɒlɪfaɪd] (كواليفايد)",
    "meaning": "مؤهّل",
    "category": "nclex_general",
    "exampleEn": "She is a qualified registered nurse.",
    "exampleAr": "هي ممرضة مسجّلة مؤهّلة."
  },
  {
    "word": "licensed",
    "ipa": "[ˈlaɪsənst] (لايسِنست)",
    "meaning": "مرخّص",
    "category": "nclex_general",
    "exampleEn": "He is a licensed practical nurse.",
    "exampleAr": "هو ممرض عملي مرخّص."
  },
  {
    "word": "residential care",
    "ipa": "[ˌrezɪˈdenʃəl ker] (رِزِدِنشَل كير)",
    "meaning": "الرعاية السكنية (دار مسنين)",
    "category": "nclex_general",
    "exampleEn": "She moved to a residential care facility.",
    "exampleAr": "انتقلت لدار رعاية سكنية."
  },
  {
    "word": "outpatient",
    "ipa": "[ˈaʊtpeɪʃənt] (أوت-پيشِنت)",
    "meaning": "مريض خارجي (غير مقيم)",
    "category": "nclex_general",
    "exampleEn": "He is treated as an outpatient.",
    "exampleAr": "بيتعالج كمريض خارجي."
  },
  {
    "word": "rural",
    "ipa": "[ˈrʊrəl] (رورَل)",
    "meaning": "ريفي",
    "category": "nclex_general",
    "exampleEn": "She works in a rural clinic.",
    "exampleAr": "بتشتغل في عيادة ريفية."
  },
  {
    "word": "influenza",
    "ipa": "[ˌɪnfluˈenzə] (إنفلوإِنزا)",
    "meaning": "الإنفلونزا",
    "category": "infectious_diseases",
    "exampleEn": "She was diagnosed with influenza.",
    "exampleAr": "اتشخّصت بالإنفلونزا."
  },
  {
    "word": "tuberculosis (TB)",
    "ipa": "[tjuːˌbɜːrkjəˈloʊsɪs] (تيوبِركيولوسِس)",
    "meaning": "مرض السل",
    "category": "infectious_diseases",
    "exampleEn": "He is being treated for tuberculosis.",
    "exampleAr": "بيتعالج من مرض السل."
  },
  {
    "word": "hepatitis",
    "ipa": "[ˌhepəˈtaɪtɪs] (هِپَتايتِس)",
    "meaning": "التهاب الكبد",
    "category": "infectious_diseases",
    "exampleEn": "She was tested for hepatitis.",
    "exampleAr": "اتعملها تحليل التهاب الكبد."
  },
  {
    "word": "sepsis",
    "ipa": "[ˈsepsɪs] (سِپسِس)",
    "meaning": "تسمم الدم/الإنتان",
    "category": "infectious_diseases",
    "exampleEn": "Sepsis requires urgent treatment.",
    "exampleAr": "تسمم الدم محتاج علاج عاجل."
  },
  {
    "word": "outbreak",
    "ipa": "[ˈaʊtbreɪk] (أوت-بريك)",
    "meaning": "تفشي المرض",
    "category": "infectious_diseases",
    "exampleEn": "There was a flu outbreak in the ward.",
    "exampleAr": "حصل تفشي إنفلونزا في القسم."
  },
  {
    "word": "occupational therapy",
    "ipa": "[ˌɒkjəˈpeɪʃənəl ˈθerəpi] (أوكيوپيشَنَل ثيرَپي)",
    "meaning": "العلاج الوظيفي",
    "category": "rehab_speech",
    "exampleEn": "Occupational therapy helps with daily tasks.",
    "exampleAr": "العلاج الوظيفي بيساعد في المهام اليومية."
  },
  {
    "word": "speech therapy",
    "ipa": "[spiːtʃ ˈθerəpi] (سپيتش ثيرَپي)",
    "meaning": "علاج النطق",
    "category": "rehab_speech",
    "exampleEn": "He attends speech therapy twice weekly.",
    "exampleAr": "بيروح علاج نطق مرتين أسبوعيًا."
  },
  {
    "word": "gait training",
    "ipa": "[ɡeɪt ˈtreɪnɪŋ] (جيت ترينِنج)",
    "meaning": "تدريب المشي",
    "category": "rehab_speech",
    "exampleEn": "Gait training improves his balance.",
    "exampleAr": "تدريب المشي بيحسّن توازنه."
  },
  {
    "word": "contrast dye",
    "ipa": "[ˈkɒntræst daɪ] (كونتراست داي)",
    "meaning": "صبغة التباين",
    "category": "radiology_extra",
    "exampleEn": "Contrast dye is injected before the scan.",
    "exampleAr": "صبغة التباين بتتحقن قبل الأشعة."
  },
  {
    "word": "mammogram",
    "ipa": "[ˈmæməɡræm] (مامو-جرام)",
    "meaning": "أشعة الثدي",
    "category": "radiology_extra",
    "exampleEn": "She is due for her annual mammogram.",
    "exampleAr": "عليها أشعة ثدي سنوية مستحقة."
  },
  {
    "word": "endoscopy",
    "ipa": "[enˈdɒskəpi] (إندوسكوپي)",
    "meaning": "المنظار",
    "category": "radiology_extra",
    "exampleEn": "An endoscopy was performed to check the stomach.",
    "exampleAr": "اتعمل منظار عشان يفحص المعدة."
  },
  {
    "word": "mild",
    "ipa": "[maɪld] (مايلد)",
    "meaning": "خفيف/بسيط",
    "category": "general_adjectives",
    "exampleEn": "It's just a mild infection.",
    "exampleAr": "ده مجرد التهاب خفيف."
  },
  {
    "word": "severe",
    "ipa": "[sɪˈvɪr] (سِڤير)",
    "meaning": "شديد",
    "category": "general_adjectives",
    "exampleEn": "He has severe abdominal pain.",
    "exampleAr": "عنده ألم بطن شديد."
  },
  {
    "word": "moderate",
    "ipa": "[ˈmɒdərət] (مودِرِت)",
    "meaning": "متوسط",
    "category": "general_adjectives",
    "exampleEn": "The pain is moderate in intensity.",
    "exampleAr": "الألم متوسط الشدة."
  },
  {
    "word": "gradual",
    "ipa": "[ˈɡrædʒuəl] (جراديوَل)",
    "meaning": "تدريجي",
    "category": "general_adjectives",
    "exampleEn": "There was a gradual improvement.",
    "exampleAr": "حصل تحسّن تدريجي."
  },
  {
    "word": "sudden",
    "ipa": "[ˈsʌdən] (سَدِن)",
    "meaning": "مفاجئ",
    "category": "general_adjectives",
    "exampleEn": "The pain was sudden and sharp.",
    "exampleAr": "الألم كان مفاجئ وحاد."
  },
  {
    "word": "persistent",
    "ipa": "[pərˈsɪstənt] (پِرسِستِنت)",
    "meaning": "مستمر",
    "category": "general_adjectives",
    "exampleEn": "He has a persistent cough.",
    "exampleAr": "عنده كحة مستمرة."
  },
  {
    "word": "recurrent",
    "ipa": "[rɪˈkʌrənt] (رِكَرِنت)",
    "meaning": "متكرر",
    "category": "general_adjectives",
    "exampleEn": "She has recurrent headaches.",
    "exampleAr": "عندها صداع متكرر."
  },
  {
    "word": "How are you feeling today?",
    "ipa": "[haʊ ɑːr juː ˈfiːlɪŋ təˈdeɪ] (هاو آر يو فيلِنج تودي)",
    "meaning": "عامل إيه النهارده؟",
    "category": "interaction_phrases",
    "exampleEn": "How are you feeling today, Mr. Ahmed?",
    "exampleAr": "عامل إيه النهارده يا أستاذ أحمد؟"
  },
  {
    "word": "Is there anything I can help with?",
    "ipa": "[ɪz ðer ˈeniθɪŋ aɪ kæn help wɪð] (إز ذير إني ثينج آي كان هِلپ ويذ)",
    "meaning": "فيه حاجة أقدر أساعدك فيها؟",
    "category": "interaction_phrases",
    "exampleEn": "Is there anything else I can help with?",
    "exampleAr": "فيه حاجة تانية أقدر أساعدك فيها؟"
  },
  {
    "word": "Let me know if you need anything.",
    "ipa": "[let miː noʊ ɪf juː niːd ˈeniθɪŋ] (ليت مي نو إف يو نيد إني ثينج)",
    "meaning": "قولّي لو محتاج حاجة.",
    "category": "interaction_phrases",
    "exampleEn": "Let me know if you need anything at all.",
    "exampleAr": "قولّي لو محتاج أي حاجة خالص."
  },
  {
    "word": "I understand this is difficult.",
    "ipa": "[aɪ ˌʌndərˈstænd ðɪs ɪz ˈdɪfɪkəlt] (آي أندِرستاند ذِس إز دِفِكَلت)",
    "meaning": "أنا فاهم إن ده صعب.",
    "category": "interaction_phrases",
    "exampleEn": "I understand this is difficult for you and your family.",
    "exampleAr": "أنا فاهم إن ده صعب عليك وعلى عيلتك."
  },
  {
    "word": "wellbeing",
    "ipa": "[ˈwelˈbiːɪŋ] (ويل-بيينج)",
    "meaning": "الرفاهية/الصحة العامة",
    "category": "general_adjectives",
    "exampleEn": "We care about the patient's overall wellbeing.",
    "exampleAr": "بنهتم بالرفاهية العامة للمريض."
  },
  {
    "word": "empathy",
    "ipa": "[ˈempəθi] (إمپَثي)",
    "meaning": "التعاطف",
    "category": "interaction_phrases",
    "exampleEn": "Empathy is essential in nursing care.",
    "exampleAr": "التعاطف أساسي في الرعاية التمريضية."
  },
  {
    "word": "registered nurse (RN)",
    "ipa": "[ˈredʒɪstərd nɜːrs] (رِجِستَرد نِرس)",
    "meaning": "ممرض مسجّل",
    "category": "nursing_roles_education",
    "exampleEn": "She works as a registered nurse in the ICU.",
    "exampleAr": "بتشتغل ممرضة مسجّلة في العناية المركزة."
  },
  {
    "word": "licensed practical nurse (LPN)",
    "ipa": "[ˈlaɪsənst ˈpræktɪkəl nɜːrs] (لايسِنست براكتِكَل نِرس)",
    "meaning": "ممرض عملي مرخّص",
    "category": "nursing_roles_education",
    "exampleEn": "The LPN assisted with basic patient care.",
    "exampleAr": "الممرض العملي المرخّص ساعد في الرعاية الأساسية."
  },
  {
    "word": "nurse practitioner",
    "ipa": "[nɜːrs prækˈtɪʃənər] (نِرس براكتِشَنَر)",
    "meaning": "ممرض ممارس (صلاحيات موسّعة)",
    "category": "nursing_roles_education",
    "exampleEn": "The nurse practitioner prescribed the medication.",
    "exampleAr": "الممرض الممارس وصف الدواء."
  },
  {
    "word": "charge nurse",
    "ipa": "[tʃɑːrdʒ nɜːrs] (تشارج نِرس)",
    "meaning": "الممرض المسؤول عن الوردية",
    "category": "nursing_roles_education",
    "exampleEn": "Report any concerns to the charge nurse.",
    "exampleAr": "بلّغ أي ملاحظات للممرض المسؤول عن الوردية."
  },
  {
    "word": "attending physician",
    "ipa": "[əˈtendɪŋ fɪˈzɪʃən] (أتِندِنج فِزِشَن)",
    "meaning": "الطبيب المعالج المسؤول",
    "category": "nursing_roles_education",
    "exampleEn": "The attending physician reviewed the case.",
    "exampleAr": "الطبيب المعالج راجع الحالة."
  },
  {
    "word": "preceptor",
    "ipa": "[prɪˈseptər] (پرِسِپتَر)",
    "meaning": "المدرّب الإكلينيكي",
    "category": "nursing_roles_education",
    "exampleEn": "My preceptor guided me through my first shift.",
    "exampleAr": "المدرّب الإكلينيكي وجّهني في أول شيفت."
  },
  {
    "word": "clinicals",
    "ipa": "[ˈklɪnɪkəlz] (كلينِكَلز)",
    "meaning": "التدريب الإكلينيكي العملي",
    "category": "nursing_roles_education",
    "exampleEn": "Nursing students complete clinicals in hospitals.",
    "exampleAr": "طلاب التمريض بيعملوا تدريب إكلينيكي في المستشفيات."
  },
  {
    "word": "charting",
    "ipa": "[ˈtʃɑːrtɪŋ] (تشارتِنج)",
    "meaning": "توثيق بيانات المريض",
    "category": "nursing_roles_education",
    "exampleEn": "Charting must be accurate and timely.",
    "exampleAr": "التوثيق لازم يكون دقيق وفي وقته."
  },
  {
    "word": "rounds",
    "ipa": "[raʊndz] (راوندز)",
    "meaning": "الجولة الطبية اليومية",
    "category": "nursing_roles_education",
    "exampleEn": "The team does rounds every morning.",
    "exampleAr": "الفريق بيعمل جولة طبية كل صبح."
  },
  {
    "word": "shift report",
    "ipa": "[ʃɪft rɪˈpɔːrt] (شِفت رِپورت)",
    "meaning": "تقرير تسليم الوردية",
    "category": "nursing_roles_education",
    "exampleEn": "Give a clear shift report to the next nurse.",
    "exampleAr": "قدّم تقرير تسليم واضح للممرض اللي بعدك."
  },
  {
    "word": "code (coding)",
    "ipa": "[koʊd] (كود)",
    "meaning": "حالة طوارئ (سكتة قلبية)",
    "category": "nursing_slang",
    "exampleEn": "The patient started coding at 3 AM.",
    "exampleAr": "المريض دخل في حالة طوارئ الساعة 3 الفجر."
  },
  {
    "word": "peds",
    "ipa": "[pedz] (پِدز)",
    "meaning": "قسم الأطفال (اختصار عامي)",
    "category": "nursing_slang",
    "exampleEn": "She transferred to peds last month.",
    "exampleAr": "اتنقلت لقسم الأطفال الشهر اللي فات."
  },
  {
    "word": "total care patient",
    "ipa": "[ˈtoʊtəl ker ˈpeɪʃənt] (توتَل كير پيشِنت)",
    "meaning": "مريض محتاج رعاية كاملة",
    "category": "nursing_slang",
    "exampleEn": "He is a total care patient after the stroke.",
    "exampleAr": "هو مريض محتاج رعاية كاملة بعد السكتة الدماغية."
  },
  {
    "word": "ambulatory patient",
    "ipa": "[ˈæmbjələtɔːri ˈpeɪʃənt] (امبيولَتوري پيشِنت)",
    "meaning": "مريض قادر على المشي",
    "category": "nursing_slang",
    "exampleEn": "He is now an ambulatory patient.",
    "exampleAr": "هو دلوقتي قادر يمشي لوحده."
  },
  {
    "word": "STAT order",
    "ipa": "[stæt ˈɔːrdər] (ستات أوردَر)",
    "meaning": "أمر طبي فوري",
    "category": "nursing_slang",
    "exampleEn": "The doctor gave a STAT order for blood work.",
    "exampleAr": "الدكتور طلب تحليل دم فوري."
  },
  {
    "word": "CBR (complete bed rest)",
    "ipa": "[siː biː ɑːr] (سي-بي-آر)",
    "meaning": "راحة تامة بالسرير",
    "category": "nursing_slang",
    "exampleEn": "The patient is on CBR for now.",
    "exampleAr": "المريض على راحة تامة بالسرير دلوقتي."
  },
  {
    "word": "ABCs (airway, breathing, circulation)",
    "ipa": "[eɪ biː siːz] (إيه-بي-سيز)",
    "meaning": "مجرى التنفس والتنفس والدورة الدموية",
    "category": "nursing_slang",
    "exampleEn": "Always check the ABCs first in an emergency.",
    "exampleAr": "دايمًا افحص مجرى التنفس والتنفس والدورة الدموية الأول في الطوارئ."
  },
  {
    "word": "ABG (arterial blood gas)",
    "ipa": "[eɪ biː dʒiː] (إيه-بي-جي)",
    "meaning": "تحليل غازات الدم الشرياني",
    "category": "clinical_abbreviations",
    "exampleEn": "An ABG was drawn to check oxygen levels.",
    "exampleAr": "اتسحب تحليل غازات دم شرياني عشان يتفحص مستوى الأكسجين."
  },
  {
    "word": "acidosis",
    "ipa": "[ˌæsɪˈdoʊsɪs] (أسِدوسِس)",
    "meaning": "الحماض (زيادة حموضة الدم)",
    "category": "clinical_abbreviations",
    "exampleEn": "The blood test showed metabolic acidosis.",
    "exampleAr": "تحليل الدم أظهر حماض استقلابي."
  },
  {
    "word": "alkalosis",
    "ipa": "[ˌælkəˈloʊsɪs] (الكالوسِس)",
    "meaning": "القلاء (زيادة قلوية الدم)",
    "category": "clinical_abbreviations",
    "exampleEn": "Respiratory alkalosis can result from rapid breathing.",
    "exampleAr": "القلاء التنفسي ممكن يحصل بسبب التنفس السريع."
  },
  {
    "word": "acuity",
    "ipa": "[əˈkjuːəti] (أكيويتي)",
    "meaning": "شدة/خطورة الحالة",
    "category": "clinical_abbreviations",
    "exampleEn": "Patient acuity determines staffing levels.",
    "exampleAr": "خطورة حالة المريض بتحدد عدد الطاقم المطلوب."
  },
  {
    "word": "AFib (atrial fibrillation)",
    "ipa": "[eɪ fɪb] (إيه-فِب)",
    "meaning": "الرجفان الأذيني",
    "category": "clinical_abbreviations",
    "exampleEn": "He was diagnosed with AFib.",
    "exampleAr": "اتشخّص بالرجفان الأذيني."
  },
  {
    "word": "CBC (complete blood count)",
    "ipa": "[siː biː siː] (سي-بي-سي)",
    "meaning": "صورة الدم الكاملة",
    "category": "clinical_abbreviations",
    "exampleEn": "A CBC was ordered to check for infection.",
    "exampleAr": "اتطلبت صورة دم كاملة للكشف عن التهاب."
  },
  {
    "word": "Foley catheter",
    "ipa": "[ˈfoʊli ˈkæθətər] (فولي كاثِتَر)",
    "meaning": "قسطرة بولية دائمة (فولي)",
    "category": "clinical_abbreviations",
    "exampleEn": "A Foley catheter was inserted after surgery.",
    "exampleAr": "قسطرة فولي اتركّبت بعد العملية."
  },
  {
    "word": "saline lock",
    "ipa": "[ˈseɪliːn lɒk] (سيلين لوك)",
    "meaning": "منفذ وريدي بمحلول ملحي",
    "category": "clinical_abbreviations",
    "exampleEn": "The IV was converted to a saline lock.",
    "exampleAr": "المحلول الوريدي اتحوّل لمنفذ بمحلول ملحي."
  },
  {
    "word": "PPI (proton pump inhibitor)",
    "ipa": "[piː piː aɪ] (پي-پي-آي)",
    "meaning": "مثبط مضخة البروتون",
    "category": "clinical_abbreviations",
    "exampleEn": "He takes a PPI for acid reflux.",
    "exampleAr": "بياخد مثبط مضخة بروتون لارتجاع الحمض."
  },
  {
    "word": "q4h (every 4 hours)",
    "ipa": "[kjuː fɔːr eɪtʃ] (كيو-فور-إتش)",
    "meaning": "كل 4 ساعات",
    "category": "clinical_abbreviations",
    "exampleEn": "Give the medication q4h.",
    "exampleAr": "أعطي الدواء كل 4 ساعات."
  },
  {
    "word": "antihypertensive",
    "ipa": "[ˌæntiˌhaɪpərˈtensɪv] (أنتي-هايپَرتِنسِڤ)",
    "meaning": "خافض لضغط الدم",
    "category": "medication_classes",
    "exampleEn": "He takes an antihypertensive daily.",
    "exampleAr": "بياخد دواء خافض لضغط الدم يوميًا."
  },
  {
    "word": "anticoagulant",
    "ipa": "[ˌæntikoʊˈæɡjələnt] (أنتي-كوآجيولَنت)",
    "meaning": "مضاد للتخثر (سيولة الدم)",
    "category": "medication_classes",
    "exampleEn": "Warfarin is a common anticoagulant.",
    "exampleAr": "الوارفارين مضاد تخثر شائع."
  },
  {
    "word": "analgesic",
    "ipa": "[ˌænəlˈdʒiːzɪk] (أنَلجيزِك)",
    "meaning": "مسكّن للألم",
    "category": "medication_classes",
    "exampleEn": "An analgesic was given for the pain.",
    "exampleAr": "اتدى مسكّن ألم."
  },
  {
    "word": "antiemetic",
    "ipa": "[ˌæntiɪˈmetɪk] (أنتي-إمِتِك)",
    "meaning": "مضاد للقيء",
    "category": "medication_classes",
    "exampleEn": "An antiemetic was administered before chemo.",
    "exampleAr": "اتدى مضاد قيء قبل الكيماوي."
  },
  {
    "word": "antipyretic",
    "ipa": "[ˌæntipaɪˈretɪk] (أنتي-بايرِتِك)",
    "meaning": "خافض للحرارة",
    "category": "medication_classes",
    "exampleEn": "Paracetamol acts as an antipyretic.",
    "exampleAr": "الباراسيتامول بيعمل كخافض حرارة."
  },
  {
    "word": "bronchodilator",
    "ipa": "[ˌbrɒŋkoʊˈdaɪleɪtər] (برونكو-دايليتَر)",
    "meaning": "موسّع للشعب الهوائية",
    "category": "medication_classes",
    "exampleEn": "Use the bronchodilator during an asthma attack.",
    "exampleAr": "استخدم الموسّع أثناء نوبة الربو."
  },
  {
    "word": "sedative",
    "ipa": "[ˈsedətɪv] (سِداتِڤ)",
    "meaning": "مهدّئ",
    "category": "medication_classes",
    "exampleEn": "A mild sedative helped her sleep.",
    "exampleAr": "مهدّئ خفيف ساعدها تنام."
  },
  {
    "word": "laxative",
    "ipa": "[ˈlæksətɪv] (لاكسَتِڤ)",
    "meaning": "ملّين",
    "category": "medication_classes",
    "exampleEn": "A laxative was prescribed for constipation.",
    "exampleAr": "اتوصف ملّين للإمساك."
  },
  {
    "word": "corticosteroid",
    "ipa": "[ˌkɔːrtɪkoʊˈstɪərɔɪd] (كورتيكو-ستِرويد)",
    "meaning": "كورتيزون",
    "category": "medication_classes",
    "exampleEn": "Corticosteroids reduce inflammation.",
    "exampleAr": "الكورتيزون بيقلل الالتهاب."
  },
  {
    "word": "anticonvulsant",
    "ipa": "[ˌæntikənˈvʌlsənt] (أنتي-كونڤَلسَنت)",
    "meaning": "مضاد للتشنجات",
    "category": "medication_classes",
    "exampleEn": "He takes an anticonvulsant for epilepsy.",
    "exampleAr": "بياخد مضاد تشنجات لعلاج الصرع."
  },
  {
    "word": "sphygmomanometer",
    "ipa": "[ˌsfɪɡmoʊməˈnɒmɪtər] (سفِجمو-مانومِتَر)",
    "meaning": "جهاز قياس ضغط الدم اليدوي",
    "category": "equipment_more",
    "exampleEn": "The nurse used a sphygmomanometer.",
    "exampleAr": "الممرض استخدم جهاز قياس ضغط يدوي."
  },
  {
    "word": "glucometer",
    "ipa": "[ɡluːˈkɒmɪtər] (جلوكومِتَر)",
    "meaning": "جهاز قياس السكر المحمول",
    "category": "equipment_more",
    "exampleEn": "Check his sugar with the glucometer.",
    "exampleAr": "افحص السكر عنده بجهاز القياس المحمول."
  },
  {
    "word": "suction catheter",
    "ipa": "[ˈsʌkʃən ˈkæθətər] (سَكشِن كاثِتَر)",
    "meaning": "قسطرة الشفط",
    "category": "equipment_more",
    "exampleEn": "Use a suction catheter to clear secretions.",
    "exampleAr": "استخدم قسطرة الشفط عشان تشيل الإفرازات."
  },
  {
    "word": "IV pole",
    "ipa": "[ˌaɪ ˈviː poʊl] (آي-ڤي پول)",
    "meaning": "حامل المحلول الوريدي",
    "category": "equipment_more",
    "exampleEn": "Attach the bag to the IV pole.",
    "exampleAr": "علّق الكيس على حامل المحلول."
  },
  {
    "word": "bedpan",
    "ipa": "[ˈbedpæn] (بِد-پان)",
    "meaning": "المرحاض المتنقل (للسرير)",
    "category": "equipment_more",
    "exampleEn": "Bring a bedpan for the patient.",
    "exampleAr": "هات مرحاض متنقل للمريض."
  },
  {
    "word": "tourniquet",
    "ipa": "[ˈtʊərnɪket] (تورنِكيت)",
    "meaning": "رباط ضاغط (لسحب الدم)",
    "category": "equipment_more",
    "exampleEn": "Apply the tourniquet before drawing blood.",
    "exampleAr": "حط الرباط الضاغط قبل سحب الدم."
  },
  {
    "word": "forceps",
    "ipa": "[ˈfɔːrsɛps] (فورسِپس)",
    "meaning": "الملقط الجراحي",
    "category": "equipment_more",
    "exampleEn": "The surgeon used forceps to remove the object.",
    "exampleAr": "الجرّاح استخدم ملقط عشان يشيل الجسم الغريب."
  },
  {
    "word": "nasal cannula",
    "ipa": "[ˈneɪzəl ˈkænjələ] (نيزَل كانيولا)",
    "meaning": "أنبوب أكسجين أنفي",
    "category": "equipment_more",
    "exampleEn": "He is on oxygen via nasal cannula.",
    "exampleAr": "بياخد أكسجين عن طريق أنبوب أنفي."
  },
  {
    "word": "cardiovascular system",
    "ipa": "[ˌkɑːrdioʊˈvæskjələr ˈsɪstəm] (كارديو-ڤاسكيولَر سِستَم)",
    "meaning": "الجهاز الدوري (القلب والأوعية)",
    "category": "body_systems",
    "exampleEn": "The cardiovascular system pumps blood throughout the body.",
    "exampleAr": "الجهاز الدوري بيضخ الدم في كل الجسم."
  },
  {
    "word": "musculoskeletal system",
    "ipa": "[ˌmʌskjəloʊˈskelɪtəl ˈsɪstəm] (مَسكيولو-سكِلِتَل سِستَم)",
    "meaning": "الجهاز العضلي الهيكلي",
    "category": "body_systems",
    "exampleEn": "The musculoskeletal system supports movement.",
    "exampleAr": "الجهاز العضلي الهيكلي بيدعم الحركة."
  },
  {
    "word": "nervous system",
    "ipa": "[ˈnɜːrvəs ˈsɪstəm] (نِرڤَس سِستَم)",
    "meaning": "الجهاز العصبي",
    "category": "body_systems",
    "exampleEn": "The nervous system controls body functions.",
    "exampleAr": "الجهاز العصبي بيتحكم في وظائف الجسم."
  },
  {
    "word": "endocrine system",
    "ipa": "[ˈendəkraɪn ˈsɪstəm] (إندَكراين سِستَم)",
    "meaning": "الجهاز الصمّاوي (الغدد)",
    "category": "body_systems",
    "exampleEn": "The endocrine system regulates hormones.",
    "exampleAr": "الجهاز الصمّاوي بينظّم الهرمونات."
  },
  {
    "word": "lymphatic system",
    "ipa": "[lɪmˈfætɪk ˈsɪstəm] (لِمفاتِك سِستَم)",
    "meaning": "الجهاز الليمفاوي",
    "category": "body_systems",
    "exampleEn": "The lymphatic system fights infection.",
    "exampleAr": "الجهاز الليمفاوي بيحارب العدوى."
  },
  {
    "word": "reproductive system",
    "ipa": "[ˌriːprəˈdʌktɪv ˈsɪstəm] (ري-پرودَكتِڤ سِستَم)",
    "meaning": "الجهاز التناسلي",
    "category": "body_systems",
    "exampleEn": "The reproductive system was examined.",
    "exampleAr": "الجهاز التناسلي اتفحص."
  },
  {
    "word": "osteoarthritis",
    "ipa": "[ˌɒstioʊɑːrˈθraɪtɪs] (أوستيو-آرثرايتِس)",
    "meaning": "خشونة المفاصل",
    "category": "common_diseases_more",
    "exampleEn": "Osteoarthritis affects her hip joint.",
    "exampleAr": "خشونة المفاصل بتأثر على مفصل وركها."
  },
  {
    "word": "rheumatoid arthritis",
    "ipa": "[ˈruːmətɔɪd ɑːrˈθraɪtɪs] (رُيوماتويد آرثرايتِس)",
    "meaning": "الروماتويد",
    "category": "common_diseases_more",
    "exampleEn": "She was diagnosed with rheumatoid arthritis.",
    "exampleAr": "اتشخّصت بالروماتويد."
  },
  {
    "word": "epilepsy",
    "ipa": "[ˈepɪlepsi] (إپِلِپسي)",
    "meaning": "الصرع",
    "category": "common_diseases_more",
    "exampleEn": "He has been managing epilepsy for years.",
    "exampleAr": "بيتحكم في الصرع من سنين."
  },
  {
    "word": "migraine",
    "ipa": "[ˈmaɪɡreɪn] (مايجرين)",
    "meaning": "الصداع النصفي",
    "category": "common_diseases_more",
    "exampleEn": "She suffers from severe migraines.",
    "exampleAr": "بتعاني من صداع نصفي شديد."
  },
  {
    "word": "cirrhosis",
    "ipa": "[sɪˈroʊsɪs] (سِيروسِس)",
    "meaning": "تليّف الكبد",
    "category": "common_diseases_more",
    "exampleEn": "Cirrhosis can result from chronic alcohol use.",
    "exampleAr": "تليّف الكبد ممكن ينتج عن إدمان الكحول المزمن."
  },
  {
    "word": "gallstones",
    "ipa": "[ˈɡɔːlstoʊnz] (جول-ستونز)",
    "meaning": "حصوات المرارة",
    "category": "common_diseases_more",
    "exampleEn": "He was treated for gallstones.",
    "exampleAr": "اتعالج من حصوات المرارة."
  },
  {
    "word": "hernia",
    "ipa": "[ˈhɜːrniə] (هِرنيا)",
    "meaning": "الفتق",
    "category": "common_diseases_more",
    "exampleEn": "He needs surgery to repair the hernia.",
    "exampleAr": "محتاج عملية عشان يصلّح الفتق."
  },
  {
    "word": "gout",
    "ipa": "[ɡaʊt] (جاوت)",
    "meaning": "النقرس",
    "category": "common_diseases_more",
    "exampleEn": "Gout causes sudden joint pain.",
    "exampleAr": "النقرس بيسبب ألم مفاجئ في المفاصل."
  },
  {
    "word": "laparoscopy",
    "ipa": "[ˌlæpəˈrɒskəpi] (لاپَروسكوپي)",
    "meaning": "منظار البطن",
    "category": "surgical_terms_more",
    "exampleEn": "The procedure was done via laparoscopy.",
    "exampleAr": "الإجراء اتعمل بمنظار البطن."
  },
  {
    "word": "appendectomy",
    "ipa": "[ˌæpənˈdektəmi] (أپِنِدِكتَمي)",
    "meaning": "استئصال الزائدة الدودية",
    "category": "surgical_terms_more",
    "exampleEn": "He underwent an emergency appendectomy.",
    "exampleAr": "اتعمله استئصال زائدة دودية طارئ."
  },
  {
    "word": "hysterectomy",
    "ipa": "[ˌhɪstəˈrektəmi] (هِستِرِكتَمي)",
    "meaning": "استئصال الرحم",
    "category": "surgical_terms_more",
    "exampleEn": "She had a hysterectomy last month.",
    "exampleAr": "اتعملها استئصال رحم الشهر اللي فات."
  },
  {
    "word": "amputation",
    "ipa": "[ˌæmpjuˈteɪʃən] (امپيوتيشِن)",
    "meaning": "بتر الطرف",
    "category": "surgical_terms_more",
    "exampleEn": "The amputation was necessary to save his life.",
    "exampleAr": "البتر كان ضروري عشان ينقذ حياته."
  },
  {
    "word": "transplant",
    "ipa": "[ˈtrænsplænt] (ترانسپلانت)",
    "meaning": "زراعة عضو",
    "category": "surgical_terms_more",
    "exampleEn": "He received a kidney transplant.",
    "exampleAr": "اتعملله زراعة كلية."
  },
  {
    "word": "skin graft",
    "ipa": "[skɪn ɡræft] (سكِن جرافت)",
    "meaning": "ترقيع جلدي",
    "category": "surgical_terms_more",
    "exampleEn": "A skin graft was used to cover the burn.",
    "exampleAr": "استُخدم ترقيع جلدي عشان يغطي الحرق."
  },
  {
    "word": "fall precautions",
    "ipa": "[fɔːl prɪˈkɔːʃənz] (فول پرِكوشِنز)",
    "meaning": "احتياطات منع السقوط",
    "category": "patient_safety",
    "exampleEn": "Fall precautions are in place for this patient.",
    "exampleAr": "احتياطات منع السقوط مطبّقة على المريض ده."
  },
  {
    "word": "restraint",
    "ipa": "[rɪˈstreɪnt] (رِستريِنت)",
    "meaning": "وسيلة تقييد (للأمان)",
    "category": "patient_safety",
    "exampleEn": "A restraint was used only as a last resort.",
    "exampleAr": "استُخدمت وسيلة تقييد كملاذ أخير بس."
  },
  {
    "word": "bed alarm",
    "ipa": "[bed əˈlɑːrm] (بِد ألارم)",
    "meaning": "منبّه السرير",
    "category": "patient_safety",
    "exampleEn": "The bed alarm alerts staff if he tries to get up.",
    "exampleAr": "منبّه السرير بينبّه الطاقم لو حاول يقوم."
  },
  {
    "word": "identification band",
    "ipa": "[aɪˌdentɪfɪˈkeɪʃən bænd] (آيدِنتِفِكيشِن باند)",
    "meaning": "سوار تعريف المريض",
    "category": "patient_safety",
    "exampleEn": "Always check the identification band before medication.",
    "exampleAr": "دايمًا افحص سوار التعريف قبل إعطاء الدواء."
  },
  {
    "word": "two-patient identifiers",
    "ipa": "[tuː ˈpeɪʃənt aɪˈdentɪfaɪərz] (تو-پيشِنت آيدِنتِفايَرز)",
    "meaning": "وسيلتا التعرّف على المريض",
    "category": "patient_safety",
    "exampleEn": "Use two-patient identifiers before any procedure.",
    "exampleAr": "استخدم وسيلتين للتعرّف على المريض قبل أي إجراء."
  },
  {
    "word": "to document",
    "ipa": "[ˈdɒkjəment] (دوكيومِنت)",
    "meaning": "يوثّق",
    "category": "common_verbs_more",
    "exampleEn": "Document all findings accurately.",
    "exampleAr": "وثّق كل الملاحظات بدقة."
  },
  {
    "word": "to delegate",
    "ipa": "[ˈdelɪɡeɪt] (دِلِجيت)",
    "meaning": "يُفوّض مهمة",
    "category": "common_verbs_more",
    "exampleEn": "Delegate simple tasks to the assistant.",
    "exampleAr": "فوّض المهام البسيطة للمساعد."
  },
  {
    "word": "to educate",
    "ipa": "[ˈedʒukeɪt] (إدجوكيت)",
    "meaning": "يُثقّف/يُعلّم",
    "category": "common_verbs_more",
    "exampleEn": "Educate the patient about the medication.",
    "exampleAr": "ثقّف المريض عن الدواء."
  },
  {
    "word": "to counsel",
    "ipa": "[ˈkaʊnsəl] (كاونسِل)",
    "meaning": "يُقدّم استشارة",
    "category": "common_verbs_more",
    "exampleEn": "Counsel the family on the next steps.",
    "exampleAr": "قدّم استشارة للعيلة عن الخطوات الجاية."
  },
  {
    "word": "to consult",
    "ipa": "[kənˈsʌlt] (كونسَلت)",
    "meaning": "يستشير",
    "category": "common_verbs_more",
    "exampleEn": "Consult a specialist if symptoms persist.",
    "exampleAr": "استشر أخصائي لو الأعراض استمرت."
  },
  {
    "word": "to collaborate",
    "ipa": "[kəˈlæbəreɪt] (كولابوريت)",
    "meaning": "يتعاون",
    "category": "common_verbs_more",
    "exampleEn": "Collaborate with the medical team.",
    "exampleAr": "اتعاون مع الفريق الطبي."
  },
  {
    "word": "allergy history",
    "ipa": "[ˈælərdʒi ˈhɪstəri] (أليرچي هِستَري)",
    "meaning": "تاريخ الحساسية",
    "category": "patient_history_terms",
    "exampleEn": "Check his allergy history before prescribing.",
    "exampleAr": "افحص تاريخ الحساسية قبل ما تصف الدواء."
  },
  {
    "word": "surgical history",
    "ipa": "[ˈsɜːrdʒɪkəl ˈhɪstəri] (سِرجِكَل هِستَري)",
    "meaning": "التاريخ الجراحي",
    "category": "patient_history_terms",
    "exampleEn": "His surgical history includes an appendectomy.",
    "exampleAr": "تاريخه الجراحي فيه استئصال زائدة."
  },
  {
    "word": "family history",
    "ipa": "[ˈfæməli ˈhɪstəri] (فامِلي هِستَري)",
    "meaning": "التاريخ العائلي",
    "category": "patient_history_terms",
    "exampleEn": "Family history of diabetes was noted.",
    "exampleAr": "اتسجّل تاريخ عائلي للسكري."
  },
  {
    "word": "social history",
    "ipa": "[ˈsoʊʃəl ˈhɪstəri] (سوشَل هِستَري)",
    "meaning": "التاريخ الاجتماعي",
    "category": "patient_history_terms",
    "exampleEn": "Social history includes smoking status.",
    "exampleAr": "التاريخ الاجتماعي بيشمل حالة التدخين."
  },
  {
    "word": "medication history",
    "ipa": "[ˌmedɪˈkeɪʃən ˈhɪstəri] (مِدِكيشِن هِستَري)",
    "meaning": "تاريخ الأدوية",
    "category": "patient_history_terms",
    "exampleEn": "Review his medication history first.",
    "exampleAr": "راجع تاريخ الأدوية بتاعه الأول."
  },
  {
    "word": "frustrated",
    "ipa": "[frʌˈstreɪtɪd] (فرَستريتِد)",
    "meaning": "محبَط",
    "category": "patient_emotions",
    "exampleEn": "He felt frustrated with the slow recovery.",
    "exampleAr": "حس بإحباط من بطء التعافي."
  },
  {
    "word": "scared",
    "ipa": "[skerd] (سكيرد)",
    "meaning": "خايف",
    "category": "patient_emotions",
    "exampleEn": "The child was scared of the injection.",
    "exampleAr": "الطفل كان خايف من الحقنة."
  },
  {
    "word": "worried",
    "ipa": "[ˈwɜːrid] (ووريد)",
    "meaning": "قلقان",
    "category": "patient_emotions",
    "exampleEn": "The family was worried about the surgery.",
    "exampleAr": "العيلة كانت قلقانة على العملية."
  },
  {
    "word": "relieved",
    "ipa": "[rɪˈliːvd] (رِليڤد)",
    "meaning": "مرتاح/مطمئن",
    "category": "patient_emotions",
    "exampleEn": "She felt relieved after the good news.",
    "exampleAr": "حست بارتياح بعد الخبر الكويس."
  },
  {
    "word": "grateful",
    "ipa": "[ˈɡreɪtfəl] (جريتفَل)",
    "meaning": "ممتن",
    "category": "patient_emotions",
    "exampleEn": "He was grateful for the care he received.",
    "exampleAr": "كان ممتن للرعاية اللي استلمها."
  },
  {
    "word": "embarrassed",
    "ipa": "[ɪmˈbærəst] (إمبارَست)",
    "meaning": "محرج",
    "category": "patient_emotions",
    "exampleEn": "She felt embarrassed discussing the symptom.",
    "exampleAr": "حست بحرج وهي بتتكلم عن العرض."
  },
  {
    "word": "compassionate",
    "ipa": "[kəmˈpæʃənət] (كومپاشِنِت)",
    "meaning": "متعاطف/رحيم",
    "category": "professional_qualities",
    "exampleEn": "A good nurse is compassionate and patient.",
    "exampleAr": "الممرض الكويس متعاطف وصبور."
  },
  {
    "word": "attentive",
    "ipa": "[əˈtentɪv] (أتِنتِڤ)",
    "meaning": "منتبه/يقظ",
    "category": "professional_qualities",
    "exampleEn": "She is very attentive to her patients' needs.",
    "exampleAr": "هي منتبهة جدًا لاحتياجات مرضاها."
  },
  {
    "word": "thorough",
    "ipa": "[ˈθʌroʊ] (ثَرو)",
    "meaning": "دقيق/شامل",
    "category": "professional_qualities",
    "exampleEn": "He did a thorough assessment.",
    "exampleAr": "عمل تقييم دقيق وشامل."
  },
  {
    "word": "punctual",
    "ipa": "[ˈpʌŋktʃuəl] (پَنكتشوَل)",
    "meaning": "ملتزم بالمواعيد",
    "category": "professional_qualities",
    "exampleEn": "Being punctual is essential in healthcare.",
    "exampleAr": "الالتزام بالمواعيد أساسي في الرعاية الصحية."
  },
  {
    "word": "meticulous",
    "ipa": "[məˈtɪkjələs] (مِتِكيولَس)",
    "meaning": "دقيق جدًا/حريص",
    "category": "professional_qualities",
    "exampleEn": "She is meticulous about documentation.",
    "exampleAr": "هي دقيقة جدًا في التوثيق."
  },
  {
    "word": "baseline",
    "ipa": "[ˈbeɪslaɪn] (بيسلاين)",
    "meaning": "القيمة الأساسية المرجعية",
    "category": "general_medical_more",
    "exampleEn": "Compare the results to the baseline.",
    "exampleAr": "قارن النتائج بالقيمة الأساسية."
  },
  {
    "word": "intervention",
    "ipa": "[ˌɪntərˈvenʃən] (إنتِرڤِنشِن)",
    "meaning": "التدخل الطبي",
    "category": "general_medical_more",
    "exampleEn": "Early intervention improves outcomes.",
    "exampleAr": "التدخل المبكر بيحسّن النتائج."
  },
  {
    "word": "complication",
    "ipa": "[ˌkɒmplɪˈkeɪʃən] (كومپلِكيشِن)",
    "meaning": "المضاعفة",
    "category": "general_medical_more",
    "exampleEn": "Infection is a possible complication.",
    "exampleAr": "الالتهاب مضاعفة محتملة."
  },
  {
    "word": "outcome",
    "ipa": "[ˈaʊtkʌm] (أوت-كَم)",
    "meaning": "النتيجة النهائية",
    "category": "general_medical_more",
    "exampleEn": "The treatment outcome was positive.",
    "exampleAr": "نتيجة العلاج كانت إيجابية."
  },
  {
    "word": "etiology",
    "ipa": "[ˌiːtiˈɒlədʒi] (إيتيولوچي)",
    "meaning": "المسبب/السببية",
    "category": "general_medical_more",
    "exampleEn": "The etiology of the disease is unknown.",
    "exampleAr": "سبب المرض مش معروف."
  },
  {
    "word": "morbidity",
    "ipa": "[mɔːrˈbɪdəti] (موربِدِتي)",
    "meaning": "معدل الإصابة بالمرض",
    "category": "general_medical_more",
    "exampleEn": "Morbidity rates have decreased.",
    "exampleAr": "معدلات الإصابة بالمرض قلّت."
  },
  {
    "word": "exudate",
    "ipa": "[ˈeksjuːdeɪt] (إكسيوديت)",
    "meaning": "الإفراز (من الجرح)",
    "category": "wound_care_more",
    "exampleEn": "There is moderate exudate from the wound.",
    "exampleAr": "فيه إفراز متوسط من الجرح."
  },
  {
    "word": "granulation tissue",
    "ipa": "[ˌɡrænjəˈleɪʃən ˈtɪʃuː] (جرانيوليشِن تِشو)",
    "meaning": "نسيج التحبب (شفاء الجرح)",
    "category": "wound_care_more",
    "exampleEn": "Granulation tissue indicates healing.",
    "exampleAr": "نسيج التحبب بيدل على الالتئام."
  },
  {
    "word": "slough",
    "ipa": "[slʌf] (سلَف)",
    "meaning": "النسيج الميت الرطب",
    "category": "wound_care_more",
    "exampleEn": "Remove the slough during dressing.",
    "exampleAr": "شيل النسيج الميت أثناء التضميد."
  },
  {
    "word": "eschar",
    "ipa": "[ˈeskɑːr] (إسكار)",
    "meaning": "القشرة الجافة (نسيج ميت)",
    "category": "wound_care_more",
    "exampleEn": "The wound has a layer of eschar.",
    "exampleAr": "الجرح فيه طبقة قشرة جافة."
  },
  {
    "word": "growth spurt",
    "ipa": "[ɡroʊθ spɜːrt] (جروث سپِرت)",
    "meaning": "طفرة النمو",
    "category": "pediatric_more",
    "exampleEn": "Teenagers often have a growth spurt.",
    "exampleAr": "المراهقين غالبًا بيحصلهم طفرة نمو."
  },
  {
    "word": "milestone",
    "ipa": "[ˈmaɪlstoʊn] (مايل-ستون)",
    "meaning": "معلم تطوري (للطفل)",
    "category": "pediatric_more",
    "exampleEn": "Walking is an important developmental milestone.",
    "exampleAr": "المشي معلم تطوري مهم."
  },
  {
    "word": "colic",
    "ipa": "[ˈkɒlɪk] (كولِك)",
    "meaning": "المغص عند الرضّع",
    "category": "pediatric_more",
    "exampleEn": "The baby cries a lot due to colic.",
    "exampleAr": "الطفل بيعيط كتير بسبب المغص."
  },
  {
    "word": "febrile seizure",
    "ipa": "[ˈfebraɪl ˈsiːʒər] (فِبرايل سيچَر)",
    "meaning": "تشنج حراري",
    "category": "pediatric_more",
    "exampleEn": "He had a febrile seizure during the fever.",
    "exampleAr": "حصله تشنج حراري أثناء السخونية."
  },
  {
    "word": "formula feeding",
    "ipa": "[ˈfɔːrmjələ ˈfiːdɪŋ] (فورميولا فيدِنج)",
    "meaning": "التغذية بالحليب الصناعي",
    "category": "pediatric_more",
    "exampleEn": "She switched to formula feeding at four months.",
    "exampleAr": "اتحوّلت للتغذية بالحليب الصناعي بعد أربعة شهور."
  },
  {
    "word": "frailty",
    "ipa": "[ˈfreɪlti] (فريلتي)",
    "meaning": "الضعف/الهشاشة (كبار السن)",
    "category": "geriatric_more",
    "exampleEn": "Frailty increases the risk of falls.",
    "exampleAr": "الضعف عند كبار السن بيزود خطر السقوط."
  },
  {
    "word": "polypharmacy",
    "ipa": "[ˌpɒliˈfɑːrməsi] (پولي-فارماسي)",
    "meaning": "تعدد الأدوية",
    "category": "geriatric_more",
    "exampleEn": "Polypharmacy is common in elderly patients.",
    "exampleAr": "تعدد الأدوية شائع عند كبار السن."
  },
  {
    "word": "activities of daily living (ADL)",
    "ipa": "[ækˈtɪvətiz əv ˈdeɪli ˈlɪvɪŋ] (أكتِڤِتيز أوف ديلي لِڤِنج)",
    "meaning": "أنشطة الحياة اليومية",
    "category": "geriatric_more",
    "exampleEn": "He needs help with activities of daily living.",
    "exampleAr": "محتاج مساعدة في أنشطة الحياة اليومية."
  },
  {
    "word": "cognitive decline",
    "ipa": "[ˈkɒɡnətɪv dɪˈklaɪn] (كوجنِتِڤ دِكلاين)",
    "meaning": "التدهور المعرفي",
    "category": "geriatric_more",
    "exampleEn": "Signs of cognitive decline were noted.",
    "exampleAr": "اتلوحظت علامات تدهور معرفي."
  },
  {
    "word": "psychosis",
    "ipa": "[saɪˈkoʊsɪs] (سايكوسِس)",
    "meaning": "الذهان",
    "category": "mental_health_more",
    "exampleEn": "He was treated for acute psychosis.",
    "exampleAr": "اتعالج من ذهان حاد."
  },
  {
    "word": "bipolar disorder",
    "ipa": "[ˌbaɪˈpoʊlər dɪsˈɔːrdər] (باي-پولَر دِسأوردَر)",
    "meaning": "اضطراب ثنائي القطب",
    "category": "mental_health_more",
    "exampleEn": "She manages bipolar disorder with medication.",
    "exampleAr": "بتتحكم في اضطراب ثنائي القطب بالدواء."
  },
  {
    "word": "counseling",
    "ipa": "[ˈkaʊnsəlɪŋ] (كاونسِلِنج)",
    "meaning": "الاستشارة النفسية",
    "category": "mental_health_more",
    "exampleEn": "He attends weekly counseling sessions.",
    "exampleAr": "بيروح جلسات استشارة نفسية أسبوعية."
  },
  {
    "word": "clear liquid diet",
    "ipa": "[klɪr ˈlɪkwɪd ˈdaɪət] (كلير لِكويد دايَت)",
    "meaning": "نظام السوائل الصافية",
    "category": "nutrition_more",
    "exampleEn": "He is on a clear liquid diet after surgery.",
    "exampleAr": "على نظام سوائل صافية بعد العملية."
  },
  {
    "word": "soft diet",
    "ipa": "[sɒft ˈdaɪət] (سوفت دايَت)",
    "meaning": "النظام الغذائي اللين",
    "category": "nutrition_more",
    "exampleEn": "A soft diet is recommended after dental surgery.",
    "exampleAr": "النظام اللين موصى بيه بعد جراحة الأسنان."
  },
  {
    "word": "TPN (total parenteral nutrition)",
    "ipa": "[tiː piː en] (تي-پي-إن)",
    "meaning": "التغذية الوريدية الكاملة",
    "category": "nutrition_more",
    "exampleEn": "He receives TPN through a central line.",
    "exampleAr": "بياخد تغذية وريدية كاملة عن طريق خط مركزي."
  },
  {
    "word": "cerebrum",
    "ipa": "[səˈriːbrəm] (سِريبرَم)",
    "meaning": "المخ الكبير",
    "category": "anatomy_detailed",
    "exampleEn": "The cerebrum controls voluntary movement.",
    "exampleAr": "المخ الكبير بيتحكم في الحركة الإرادية."
  },
  {
    "word": "cerebellum",
    "ipa": "[ˌserəˈbeləm] (سِرِبِلَم)",
    "meaning": "المخيخ",
    "category": "anatomy_detailed",
    "exampleEn": "The cerebellum controls balance.",
    "exampleAr": "المخيخ بيتحكم في التوازن."
  },
  {
    "word": "trachea",
    "ipa": "[ˈtreɪkiə] (تريكيا)",
    "meaning": "القصبة الهوائية",
    "category": "anatomy_detailed",
    "exampleEn": "The trachea carries air to the lungs.",
    "exampleAr": "القصبة الهوائية بتنقل الهوا للرئتين."
  },
  {
    "word": "diaphragm",
    "ipa": "[ˈdaɪəfræm] (دايَفرام)",
    "meaning": "الحجاب الحاجز",
    "category": "anatomy_detailed",
    "exampleEn": "The diaphragm helps with breathing.",
    "exampleAr": "الحجاب الحاجز بيساعد في التنفس."
  },
  {
    "word": "esophagus",
    "ipa": "[ɪˈsɒfəɡəs] (إسوفَجَس)",
    "meaning": "المريء",
    "category": "anatomy_detailed",
    "exampleEn": "Food passes through the esophagus.",
    "exampleAr": "الأكل بيعدي من خلال المريء."
  },
  {
    "word": "gallbladder",
    "ipa": "[ˈɡɔːlblædər] (جول-بلادَر)",
    "meaning": "المرارة",
    "category": "anatomy_detailed",
    "exampleEn": "The gallbladder stores bile.",
    "exampleAr": "المرارة بتخزن العصارة الصفراوية."
  },
  {
    "word": "spleen",
    "ipa": "[spliːn] (سبلين)",
    "meaning": "الطحال",
    "category": "anatomy_detailed",
    "exampleEn": "The spleen filters blood.",
    "exampleAr": "الطحال بيرشّح الدم."
  },
  {
    "word": "colon",
    "ipa": "[ˈkoʊlən] (كولَن)",
    "meaning": "القولون",
    "category": "anatomy_detailed",
    "exampleEn": "The colon absorbs water from waste.",
    "exampleAr": "القولون بيمتص المية من الفضلات."
  },
  {
    "word": "rectum",
    "ipa": "[ˈrektəm] (رِكتَم)",
    "meaning": "المستقيم",
    "category": "anatomy_detailed",
    "exampleEn": "A rectal exam was performed.",
    "exampleAr": "اتعمل فحص للمستقيم."
  },
  {
    "word": "cartilage",
    "ipa": "[ˈkɑːrtəlɪdʒ] (كارتِلِج)",
    "meaning": "الغضروف",
    "category": "anatomy_detailed",
    "exampleEn": "Cartilage cushions the joints.",
    "exampleAr": "الغضروف بيوسّد المفاصل."
  },
  {
    "word": "nerve",
    "ipa": "[nɜːrv] (نِرڤ)",
    "meaning": "العصب",
    "category": "anatomy_detailed",
    "exampleEn": "A pinched nerve causes pain.",
    "exampleAr": "العصب المضغوط بيسبب ألم."
  },
  {
    "word": "capillary",
    "ipa": "[ˈkæpəleri] (كاپِلَري)",
    "meaning": "الشعيرة الدموية",
    "category": "anatomy_detailed",
    "exampleEn": "Capillaries connect arteries and veins.",
    "exampleAr": "الشعيرات الدموية بتوصل الشرايين بالأوردة."
  },
  {
    "word": "Apply direct pressure.",
    "ipa": "[əˈplaɪ dɪˈrekt ˈpreʃər] (أپلاي دايركت پريشَر)",
    "meaning": "اضغط مباشرة على المكان.",
    "category": "first_aid_phrases",
    "exampleEn": "Apply direct pressure to stop the bleeding.",
    "exampleAr": "اضغط مباشرة عشان توقف النزيف."
  },
  {
    "word": "Call for help immediately.",
    "ipa": "[kɔːl fɔːr help ɪˈmiːdiətli] (كول فور هِلپ إميديَتلي)",
    "meaning": "اطلب المساعدة فورًا.",
    "category": "first_aid_phrases",
    "exampleEn": "Call for help immediately if he collapses.",
    "exampleAr": "اطلب المساعدة فورًا لو حصله انهيار."
  },
  {
    "word": "Keep the airway clear.",
    "ipa": "[kiːp ðə ˈeərweɪ klɪr] (كيپ ذا إيروي كلير)",
    "meaning": "خلّي مجرى التنفس مفتوح.",
    "category": "first_aid_phrases",
    "exampleEn": "Keep the airway clear at all times.",
    "exampleAr": "خلّي مجرى التنفس مفتوح طول الوقت."
  },
  {
    "word": "Do not move the patient.",
    "ipa": "[duː nɒt muːv ðə ˈpeɪʃənt] (دو نوت موڤ ذا پيشِنت)",
    "meaning": "متحركش المريض.",
    "category": "first_aid_phrases",
    "exampleEn": "Do not move the patient if a spinal injury is suspected.",
    "exampleAr": "متحركش المريض لو فيه شك إصابة بالعمود الفقري."
  },
  {
    "word": "Check for a response.",
    "ipa": "[tʃek fɔːr ə rɪˈspɒns] (تشِك فور أ رِسپونس)",
    "meaning": "افحص لو فيه استجابة.",
    "category": "first_aid_phrases",
    "exampleEn": "Check for a response before starting CPR.",
    "exampleAr": "افحص لو فيه استجابة قبل ما تبدأ الإنعاش."
  },
  {
    "word": "Avoid driving for 24 hours.",
    "ipa": "[əˈvɔɪd ˈdraɪvɪŋ fɔːr ˌtwenti fɔːr ˈaʊərz] (أفويد درايڤِنج فور 24 آورز)",
    "meaning": "تجنّب القيادة 24 ساعة.",
    "category": "discharge_more",
    "exampleEn": "Avoid driving for 24 hours after anesthesia.",
    "exampleAr": "تجنّب القيادة 24 ساعة بعد التخدير."
  },
  {
    "word": "Do not remove the dressing.",
    "ipa": "[duː nɒt rɪˈmuːv ðə ˈdresɪŋ] (دو نوت رِموڤ ذا دريسِنج)",
    "meaning": "متشلش الضمادة.",
    "category": "discharge_more",
    "exampleEn": "Do not remove the dressing for 48 hours.",
    "exampleAr": "متشلش الضمادة لمدة 48 ساعة."
  },
  {
    "word": "Complete the full course of antibiotics.",
    "ipa": "[kəmˈpliːt ðə fʊl kɔːrs əv ˌæntibaɪˈɒtɪks] (كومپليت ذا فول كورس أوف أنتي-بايوتِكس)",
    "meaning": "خلّص الكورس كامل من المضاد الحيوي.",
    "category": "discharge_more",
    "exampleEn": "Complete the full course of antibiotics even if you feel better.",
    "exampleAr": "خلّص كورس المضاد الحيوي كامل حتى لو حسّيت إنك اتحسّنت."
  },
  {
    "word": "Attend your follow-up appointment.",
    "ipa": "[əˈtend jʊər ˈfɒloʊ ʌp əˈpɔɪntmənt] (أتِند يور فولو-أپ أپوينتمِنت)",
    "meaning": "احضر موعد المتابعة.",
    "category": "discharge_more",
    "exampleEn": "Please attend your follow-up appointment next week.",
    "exampleAr": "من فضلك احضر موعد المتابعة الأسبوع الجاي."
  },
  {
    "word": "prior to",
    "ipa": "[ˈpraɪər tuː] (برايَر تو)",
    "meaning": "قبل",
    "category": "medical_time_words",
    "exampleEn": "Fast prior to the blood test.",
    "exampleAr": "صوم قبل تحليل الدم."
  },
  {
    "word": "immediately",
    "ipa": "[ɪˈmiːdiətli] (إميديَتلي)",
    "meaning": "فورًا",
    "category": "medical_time_words",
    "exampleEn": "Notify the doctor immediately.",
    "exampleAr": "بلّغ الدكتور فورًا."
  },
  {
    "word": "as directed",
    "ipa": "[æz dɪˈrektɪd] (از دايركتِد)",
    "meaning": "حسب التوجيهات",
    "category": "medical_time_words",
    "exampleEn": "Take the medication as directed.",
    "exampleAr": "خد الدواء حسب التوجيهات."
  },
  {
    "word": "within 24 hours",
    "ipa": "[wɪˈðɪn ˌtwenti fɔːr ˈaʊərz] (وِذِن 24 آورز)",
    "meaning": "خلال 24 ساعة",
    "category": "medical_time_words",
    "exampleEn": "Results will be ready within 24 hours.",
    "exampleAr": "النتائج هتكون جاهزة خلال 24 ساعة."
  },
  {
    "word": "on an empty stomach",
    "ipa": "[ɒn æn ˈempti ˈstʌmək] (أون أن إمبتي ستَمَك)",
    "meaning": "على معدة فارغة",
    "category": "medical_time_words",
    "exampleEn": "Take this tablet on an empty stomach.",
    "exampleAr": "خد القرص ده على معدة فارغة."
  },
  {
    "word": "every other day",
    "ipa": "[ˈevri ˈʌðər deɪ] (إيڤري أذَر دي)",
    "meaning": "كل يومين",
    "category": "medical_time_words",
    "exampleEn": "Take the injection every other day.",
    "exampleAr": "خد الحقنة كل يومين."
  },
  {
    "word": "pain scale",
    "ipa": "[peɪn skeɪl] (پين سكيل)",
    "meaning": "مقياس الألم",
    "category": "pain_management",
    "exampleEn": "Rate your pain on the pain scale from one to ten.",
    "exampleAr": "قيّم ألمك على مقياس الألم من واحد لعشرة."
  },
  {
    "word": "throbbing pain",
    "ipa": "[ˈθrɒbɪŋ peɪn] (ثروبِنج پين)",
    "meaning": "ألم نابض",
    "category": "pain_management",
    "exampleEn": "He described a throbbing pain in his head.",
    "exampleAr": "وصف ألم نابض في دماغه."
  },
  {
    "word": "sharp pain",
    "ipa": "[ʃɑːrp peɪn] (شارپ پين)",
    "meaning": "ألم حاد",
    "category": "pain_management",
    "exampleEn": "She felt a sharp pain in her chest.",
    "exampleAr": "حست بألم حاد في صدرها."
  },
  {
    "word": "dull ache",
    "ipa": "[dʌl eɪk] (دَل إيك)",
    "meaning": "ألم خفيف مستمر",
    "category": "pain_management",
    "exampleEn": "There is a dull ache in his lower back.",
    "exampleAr": "فيه ألم خفيف مستمر في أسفل ضهره."
  },
  {
    "word": "pain relief",
    "ipa": "[peɪn rɪˈliːf] (پين رِليف)",
    "meaning": "تسكين الألم",
    "category": "pain_management",
    "exampleEn": "The medication provides pain relief.",
    "exampleAr": "الدواء بيوفّر تسكين للألم."
  },
  {
    "word": "booster shot",
    "ipa": "[ˈbuːstər ʃɒt] (بوستَر شوت)",
    "meaning": "جرعة معززة",
    "category": "vaccination_more",
    "exampleEn": "He received a booster shot this year.",
    "exampleAr": "استلم جرعة معززة السنة دي."
  },
  {
    "word": "live vaccine",
    "ipa": "[laɪv vækˈsiːn] (لايڤ ڤاكسين)",
    "meaning": "لقاح حي",
    "category": "vaccination_more",
    "exampleEn": "This is a live vaccine, avoid during pregnancy.",
    "exampleAr": "ده لقاح حي، تجنّبه أثناء الحمل."
  },
  {
    "word": "side effect (vaccine)",
    "ipa": "[saɪd ɪˈfekt] (سايد إفِكت)",
    "meaning": "أثر جانبي (للقاح)",
    "category": "vaccination_more",
    "exampleEn": "Mild fever is a common side effect.",
    "exampleAr": "السخونية الخفيفة أثر جانبي شائع."
  },
  {
    "word": "paracetamol",
    "ipa": "[ˌpærəˈsiːtəmɒl] (پارَسيتامول)",
    "meaning": "الباراسيتامول",
    "category": "common_drug_names",
    "exampleEn": "Take paracetamol for the fever.",
    "exampleAr": "خد باراسيتامول للحرارة."
  },
  {
    "word": "ibuprofen",
    "ipa": "[ˌaɪbjuːˈproʊfən] (آيبيوپروفِن)",
    "meaning": "الإيبوبروفين",
    "category": "common_drug_names",
    "exampleEn": "Ibuprofen reduces inflammation.",
    "exampleAr": "الإيبوبروفين بيقلل الالتهاب."
  },
  {
    "word": "aspirin",
    "ipa": "[ˈæsprɪn] (أسپرِن)",
    "meaning": "الأسبرين",
    "category": "common_drug_names",
    "exampleEn": "He takes a low-dose aspirin daily.",
    "exampleAr": "بياخد أسبرين بجرعة قليلة يوميًا."
  },
  {
    "word": "amoxicillin",
    "ipa": "[əˌmɒksɪˈsɪlɪn] (أموكسِسِلِن)",
    "meaning": "الأموكسيسيلين",
    "category": "common_drug_names",
    "exampleEn": "Amoxicillin was prescribed for the infection.",
    "exampleAr": "اتوصف أموكسيسيلين للعدوى."
  },
  {
    "word": "metformin",
    "ipa": "[metˈfɔːrmɪn] (مِتفورمِن)",
    "meaning": "الميتفورمين",
    "category": "common_drug_names",
    "exampleEn": "Metformin helps control blood sugar.",
    "exampleAr": "الميتفورمين بيساعد يتحكم في السكر."
  },
  {
    "word": "morphine",
    "ipa": "[ˈmɔːrfiːn] (مورفين)",
    "meaning": "المورفين",
    "category": "common_drug_names",
    "exampleEn": "Morphine was given for severe pain.",
    "exampleAr": "اتدى مورفين للألم الشديد."
  },
  {
    "word": "oriented to time and place",
    "ipa": "[ˈɔːrienti d tuː taɪm ænd pleɪs] (أورينتِد تو تايم آند پليس)",
    "meaning": "مدرك للزمان والمكان",
    "category": "assessment_phrases",
    "exampleEn": "The patient is oriented to time and place.",
    "exampleAr": "المريض مدرك للزمان والمكان."
  },
  {
    "word": "responds to pain",
    "ipa": "[rɪˈspɒndz tuː peɪn] (رِسپوندز تو پين)",
    "meaning": "بيستجيب للألم",
    "category": "assessment_phrases",
    "exampleEn": "He only responds to pain stimuli.",
    "exampleAr": "بيستجيب بس لمثيرات الألم."
  },
  {
    "word": "pupils equal and reactive",
    "ipa": "[ˈpjuːpəlz ˈiːkwəl ænd riˈæktɪv] (پيوپِلز إيكوَل آند رياكتِڤ)",
    "meaning": "حدقتان متساويتان ومتفاعلتان",
    "category": "assessment_phrases",
    "exampleEn": "Pupils equal and reactive to light.",
    "exampleAr": "الحدقتان متساويتان ومتفاعلتان مع الضوء."
  },
  {
    "word": "skin turgor",
    "ipa": "[skɪn ˈtɜːrɡər] (سكِن تِرجَر)",
    "meaning": "مرونة الجلد",
    "category": "assessment_phrases",
    "exampleEn": "Skin turgor is a sign of hydration.",
    "exampleAr": "مرونة الجلد علامة على الترطيب."
  },
  {
    "word": "capillary refill",
    "ipa": "[ˈkæpəleri rɪˈfɪl] (كاپِلَري رِفِل)",
    "meaning": "زمن امتلاء الشعيرات الدموية",
    "category": "assessment_phrases",
    "exampleEn": "Capillary refill was less than two seconds.",
    "exampleAr": "زمن امتلاء الشعيرات كان أقل من ثانيتين."
  },
  {
    "word": "range of motion exercises",
    "ipa": "[reɪndʒ əv ˈmoʊʃən ˈeksərsaɪzɪz] (رينج أوف موشِن إكسِرسايزِز)",
    "meaning": "تمارين مدى الحركة",
    "category": "rehab_more",
    "exampleEn": "Perform range of motion exercises daily.",
    "exampleAr": "اعمل تمارين مدى الحركة يوميًا."
  },
  {
    "word": "assistive device",
    "ipa": "[əˈsɪstɪv dɪˈvaɪs] (أسِستِڤ دِڤايس)",
    "meaning": "وسيلة مساعدة",
    "category": "rehab_more",
    "exampleEn": "He uses an assistive device to walk.",
    "exampleAr": "بيستخدم وسيلة مساعدة عشان يمشي."
  },
  {
    "word": "independence",
    "ipa": "[ˌɪndɪˈpendəns] (إندِپِندِنس)",
    "meaning": "الاستقلالية",
    "category": "rehab_more",
    "exampleEn": "The goal is to regain independence.",
    "exampleAr": "الهدف استعادة الاستقلالية."
  },
  {
    "word": "handoff",
    "ipa": "[ˈhændɒf] (هاند-أوف)",
    "meaning": "تسليم المسؤولية",
    "category": "professional_communication",
    "exampleEn": "A proper handoff prevents errors.",
    "exampleAr": "التسليم الصحيح بيمنع الأخطاء."
  },
  {
    "word": "escalate",
    "ipa": "[ˈeskəleɪt] (إسكَليت)",
    "meaning": "يصعّد (يبلّغ لمستوى أعلى)",
    "category": "professional_communication",
    "exampleEn": "Escalate the concern to the supervisor.",
    "exampleAr": "صعّد الملاحظة للمشرف."
  },
  {
    "word": "clarify",
    "ipa": "[ˈklærɪfaɪ] (كلارِفاي)",
    "meaning": "يوضّح",
    "category": "professional_communication",
    "exampleEn": "Please clarify the dosage instructions.",
    "exampleAr": "من فضلك وضّح تعليمات الجرعة."
  },
  {
    "word": "verbal order",
    "ipa": "[ˈvɜːrbəl ˈɔːrdər] (ڤِربَل أوردَر)",
    "meaning": "أمر طبي شفهي",
    "category": "professional_communication",
    "exampleEn": "A verbal order must be confirmed in writing.",
    "exampleAr": "الأمر الشفهي لازم يتأكد كتابيًا."
  },
  {
    "word": "private room",
    "ipa": "[ˈpraɪvət ruːm] (برايڤِت روم)",
    "meaning": "غرفة خاصة",
    "category": "bed_room_types",
    "exampleEn": "He was moved to a private room.",
    "exampleAr": "اتنقل لغرفة خاصة."
  },
  {
    "word": "shared ward",
    "ipa": "[ʃerd wɔːrd] (شيرد وورد)",
    "meaning": "قسم مشترك",
    "category": "bed_room_types",
    "exampleEn": "She is staying in a shared ward.",
    "exampleAr": "مقيمة في قسم مشترك."
  },
  {
    "word": "adjustable bed",
    "ipa": "[əˈdʒʌstəbəl bed] (أدجَستَبِل بِد)",
    "meaning": "سرير قابل للتعديل",
    "category": "bed_room_types",
    "exampleEn": "Raise the adjustable bed slightly.",
    "exampleAr": "ارفع السرير القابل للتعديل شوية."
  },
  {
    "word": "cotton swab",
    "ipa": "[ˈkɒtən swɒb] (كوتِن سواب)",
    "meaning": "قطنة/عود قطن طبي",
    "category": "medical_supplies",
    "exampleEn": "Use a cotton swab to clean the area.",
    "exampleAr": "استخدم قطنة عشان تنضّف المنطقة."
  },
  {
    "word": "adhesive tape",
    "ipa": "[ədˈhiːsɪv teɪp] (أدهيسِڤ تيپ)",
    "meaning": "شريط لاصق طبي",
    "category": "medical_supplies",
    "exampleEn": "Secure the dressing with adhesive tape.",
    "exampleAr": "ثبّت الضمادة بشريط لاصق."
  },
  {
    "word": "antiseptic",
    "ipa": "[ˌæntiˈseptɪk] (أنتي-سِپتِك)",
    "meaning": "مطهّر",
    "category": "medical_supplies",
    "exampleEn": "Clean the wound with antiseptic solution.",
    "exampleAr": "نضّف الجرح بمحلول مطهّر."
  },
  {
    "word": "disposable gloves",
    "ipa": "[dɪˈspoʊzəbəl ɡlʌvz] (دِسپوزَبِل جلَڤز)",
    "meaning": "قفازات يُستعمل مرة واحدة",
    "category": "medical_supplies",
    "exampleEn": "Always use disposable gloves.",
    "exampleAr": "دايمًا استخدم قفازات تُستعمل مرة واحدة."
  },
  {
    "word": "admission",
    "ipa": "[ədˈmɪʃən] (أدمِشِن)",
    "meaning": "دخول المستشفى",
    "category": "admission_process",
    "exampleEn": "His admission was for chest pain.",
    "exampleAr": "دخوله المستشفى كان بسبب ألم صدر."
  },
  {
    "word": "registration",
    "ipa": "[ˌredʒɪˈstreɪʃən] (رِجِستريشِن)",
    "meaning": "التسجيل",
    "category": "admission_process",
    "exampleEn": "Complete the registration form first.",
    "exampleAr": "خلّص استمارة التسجيل الأول."
  },
  {
    "word": "insurance details",
    "ipa": "[ɪnˈʃʊərəns ˈdiːteɪlz] (إنشورَنس ديتيلز)",
    "meaning": "بيانات التأمين",
    "category": "admission_process",
    "exampleEn": "Please provide your insurance details.",
    "exampleAr": "من فضلك قدّم بيانات التأمين."
  },
  {
    "word": "waiting room",
    "ipa": "[ˈweɪtɪŋ ruːm] (ويتِنج روم)",
    "meaning": "غرفة الانتظار",
    "category": "admission_process",
    "exampleEn": "Please have a seat in the waiting room.",
    "exampleAr": "من فضلك اقعد في غرفة الانتظار."
  },
  {
    "word": "bed availability",
    "ipa": "[bed əˌveɪləˈbɪləti] (بِد أڤيلَبِلِتي)",
    "meaning": "توفّر الأسرّة",
    "category": "admission_process",
    "exampleEn": "We are checking bed availability now.",
    "exampleAr": "بنفحص توفّر الأسرّة دلوقتي."
  },
  {
    "word": "inspection",
    "ipa": "[ɪnˈspekʃən] (إنسپِكشِن)",
    "meaning": "الفحص بالنظر",
    "category": "physical_exam_more",
    "exampleEn": "Inspection revealed no visible swelling.",
    "exampleAr": "الفحص بالنظر مفيهوش تورّم واضح."
  },
  {
    "word": "percussion",
    "ipa": "[pərˈkʌʃən] (پِركَشِن)",
    "meaning": "الفحص بالنقر",
    "category": "physical_exam_more",
    "exampleEn": "Percussion of the chest was normal.",
    "exampleAr": "الفحص بالنقر على الصدر كان طبيعي."
  },
  {
    "word": "reflexes",
    "ipa": "[ˈriːfleksɪz] (ريفلِكسِز)",
    "meaning": "المنعكسات",
    "category": "physical_exam_more",
    "exampleEn": "His reflexes are normal.",
    "exampleAr": "المنعكسات عنده طبيعية."
  },
  {
    "word": "range of motion",
    "ipa": "[reɪndʒ əv ˈmoʊʃən] (رينج أوف موشِن)",
    "meaning": "مدى الحركة",
    "category": "physical_exam_more",
    "exampleEn": "Full range of motion was observed.",
    "exampleAr": "اتلوحظ مدى حركة كامل."
  },
  {
    "word": "I need your signature here.",
    "ipa": "[aɪ niːd jʊər ˈsɪɡnətʃər hɪr] (آي نيد يور سِجنَتشَر هير)",
    "meaning": "محتاج توقيعك هنا.",
    "category": "consent_refusal",
    "exampleEn": "I need your signature here to proceed.",
    "exampleAr": "محتاج توقيعك هنا عشان نكمل."
  },
  {
    "word": "Do you have any questions?",
    "ipa": "[duː juː hæv ˈeni ˈkwestʃənz] (دو يو هاڤ إني كوستشِنز)",
    "meaning": "عندك أي أسئلة؟",
    "category": "consent_refusal",
    "exampleEn": "Do you have any questions before we start?",
    "exampleAr": "عندك أي أسئلة قبل ما نبدأ؟"
  },
  {
    "word": "You have the right to refuse.",
    "ipa": "[juː hæv ðə raɪt tuː rɪˈfjuːz] (يو هاڤ ذا رايت تو رِفيوز)",
    "meaning": "من حقك ترفض.",
    "category": "consent_refusal",
    "exampleEn": "You have the right to refuse this treatment.",
    "exampleAr": "من حقك ترفض العلاج ده."
  },
  {
    "word": "This is a routine procedure.",
    "ipa": "[ðɪs ɪz ə ruːˈtiːn prəˈsiːdʒər] (ذِس إز أ روتين پروسيجَر)",
    "meaning": "ده إجراء روتيني.",
    "category": "reassurance_phrases",
    "exampleEn": "This is a routine procedure, nothing to worry about.",
    "exampleAr": "ده إجراء روتيني، متقلقش."
  },
  {
    "word": "You're doing great.",
    "ipa": "[jʊr ˈduːɪŋ ɡreɪt] (يور دوينج جريت)",
    "meaning": "أنت بتعمل حاجة كويسة.",
    "category": "reassurance_phrases",
    "exampleEn": "You're doing great, just a little more.",
    "exampleAr": "أنت بتعمل كويس، شوية كمان."
  },
  {
    "word": "Almost done.",
    "ipa": "[ˈɔːlmoʊst dʌn] (أولموست دَن)",
    "meaning": "خلصنا تقريبًا.",
    "category": "reassurance_phrases",
    "exampleEn": "Almost done, hang in there.",
    "exampleAr": "خلصنا تقريبًا، استحمل شوية."
  },
  {
    "word": "distended abdomen",
    "ipa": "[dɪˈstendɪd ˈæbdəmən] (دِستِندِد أبدَمِن)",
    "meaning": "بطن منتفخ",
    "category": "clinical_exam_extra",
    "exampleEn": "He presented with a distended abdomen.",
    "exampleAr": "جه بحالة بطن منتفخ."
  },
  {
    "word": "tender",
    "ipa": "[ˈtendər] (تِندَر)",
    "meaning": "مؤلم عند اللمس",
    "category": "clinical_exam_extra",
    "exampleEn": "The area is tender to touch.",
    "exampleAr": "المنطقة دي مؤلمة عند اللمس."
  },
  {
    "word": "rigid",
    "ipa": "[ˈrɪdʒɪd] (رِجِد)",
    "meaning": "متصلّب",
    "category": "clinical_exam_extra",
    "exampleEn": "The abdomen was rigid on examination.",
    "exampleAr": "البطن كان متصلّب عند الفحص."
  },
  {
    "word": "guarding",
    "ipa": "[ˈɡɑːrdɪŋ] (جاردِنج)",
    "meaning": "تيبّس دفاعي (وقاية من الألم)",
    "category": "clinical_exam_extra",
    "exampleEn": "Guarding was noted during palpation.",
    "exampleAr": "اتلوحظ تيبّس دفاعي أثناء الفحص باللمس."
  },
  {
    "word": "milligram (mg)",
    "ipa": "[ˈmɪlɪɡræm] (مِلي-جرام)",
    "meaning": "المليجرام",
    "category": "measurement_terms",
    "exampleEn": "Take 500 milligrams twice a day.",
    "exampleAr": "خد 500 مليجرام مرتين يوميًا."
  },
  {
    "word": "milliliter (mL)",
    "ipa": "[ˈmɪlɪliːtər] (مِلي-ليتَر)",
    "meaning": "المليلتر",
    "category": "measurement_terms",
    "exampleEn": "Give 5 milliliters of syrup.",
    "exampleAr": "هات 5 مليلتر شراب."
  },
  {
    "word": "kilogram (kg)",
    "ipa": "[ˈkɪləɡræm] (كيلوجرام)",
    "meaning": "الكيلوجرام",
    "category": "measurement_terms",
    "exampleEn": "The dose is calculated per kilogram.",
    "exampleAr": "الجرعة بتتحسب على الكيلوجرام."
  },
  {
    "word": "Celsius",
    "ipa": "[ˈselsiəs] (سِلسيَس)",
    "meaning": "درجة مئوية",
    "category": "measurement_terms",
    "exampleEn": "The temperature is 38 degrees Celsius.",
    "exampleAr": "الحرارة 38 درجة مئوية."
  },
  {
    "word": "bed capacity",
    "ipa": "[bed kəˈpæsəti] (بِد كَپاسِتي)",
    "meaning": "السعة السريرية",
    "category": "admin_more",
    "exampleEn": "The hospital is at full bed capacity.",
    "exampleAr": "المستشفى وصلت للسعة الكاملة."
  },
  {
    "word": "occupancy rate",
    "ipa": "[ˈɒkjəpənsi reɪt] (أوكيوپَنسي ريت)",
    "meaning": "نسبة الإشغال",
    "category": "admin_more",
    "exampleEn": "The occupancy rate rose this winter.",
    "exampleAr": "نسبة الإشغال زادت الشتا ده."
  },
  {
    "word": "length of stay",
    "ipa": "[leŋθ əv steɪ] (لِنجث أوف ستاي)",
    "meaning": "مدة الإقامة بالمستشفى",
    "category": "admin_more",
    "exampleEn": "His length of stay was five days.",
    "exampleAr": "مدة إقامته كانت خمس أيام."
  },
  {
    "word": "Fasting is required.",
    "ipa": "[ˈfɑːstɪŋ ɪz rɪˈkwaɪərd] (فاستِنج إز رِكوايَرد)",
    "meaning": "الصيام مطلوب.",
    "category": "test_communication",
    "exampleEn": "Fasting is required for this blood test.",
    "exampleAr": "الصيام مطلوب لتحليل الدم ده."
  },
  {
    "word": "The results will take a few days.",
    "ipa": "[ðə rɪˈzʌlts wɪl teɪk ə fjuː deɪz] (ذا رِزَلتس ويل تيك أ فيو ديز)",
    "meaning": "النتائج هتاخد كام يوم.",
    "category": "test_communication",
    "exampleEn": "The results will take a few days to come back.",
    "exampleAr": "النتائج هتاخد كام يوم عشان تطلع."
  },
  {
    "word": "Please remain still.",
    "ipa": "[pliːz rɪˈmeɪn stɪl] (پليز رِمين ستِل)",
    "meaning": "من فضلك ابقى ثابت.",
    "category": "test_communication",
    "exampleEn": "Please remain still during the scan.",
    "exampleAr": "من فضلك ابقى ثابت أثناء الأشعة."
  },
  {
    "word": "comfort measures",
    "ipa": "[ˈkʌmfərt ˈmeʒərz] (كَمفَرت مِچَرز)",
    "meaning": "إجراءات الراحة",
    "category": "palliative_more",
    "exampleEn": "The family chose comfort measures only.",
    "exampleAr": "العيلة اختارت إجراءات الراحة بس."
  },
  {
    "word": "end-of-life care",
    "ipa": "[end əv laɪf ker] (إند-أوف-لايف كير)",
    "meaning": "رعاية نهاية الحياة",
    "category": "palliative_more",
    "exampleEn": "End-of-life care focuses on dignity.",
    "exampleAr": "رعاية نهاية الحياة بتركّز على الكرامة."
  },
  {
    "word": "preventive medicine",
    "ipa": "[prɪˈventɪv ˈmedɪsɪn] (پرِڤِنتِڤ مِدِسِن)",
    "meaning": "الطب الوقائي",
    "category": "preventive_care",
    "exampleEn": "Preventive medicine reduces hospital visits.",
    "exampleAr": "الطب الوقائي بيقلل زيارات المستشفى."
  },
  {
    "word": "early detection",
    "ipa": "[ˈɜːrli dɪˈtekʃən] (إرلي دِتِكشِن)",
    "meaning": "الكشف المبكر",
    "category": "preventive_care",
    "exampleEn": "Early detection saves lives.",
    "exampleAr": "الكشف المبكر بينقذ حياة."
  },
  {
    "word": "routine check-up",
    "ipa": "[ruːˈtiːn tʃek ʌp] (روتين تشِك-أپ)",
    "meaning": "الفحص الدوري",
    "category": "preventive_care",
    "exampleEn": "He has a routine check-up every year.",
    "exampleAr": "بيعمل فحص دوري كل سنة."
  },
  {
    "word": "numbness",
    "ipa": "[ˈnʌmnəs] (نَمنِس)",
    "meaning": "الخدر",
    "category": "neuro_sensory",
    "exampleEn": "She reported numbness in her hand.",
    "exampleAr": "أبلغت عن خدر في إيدها."
  },
  {
    "word": "tingling",
    "ipa": "[ˈtɪŋɡlɪŋ] (تِنجلِنج)",
    "meaning": "الوخز/التنميل",
    "category": "neuro_sensory",
    "exampleEn": "He felt tingling in his fingers.",
    "exampleAr": "حس بتنميل في صوابعه."
  },
  {
    "word": "tremor",
    "ipa": "[ˈtremər] (تريمَر)",
    "meaning": "الرعاش",
    "category": "neuro_sensory",
    "exampleEn": "A hand tremor was observed.",
    "exampleAr": "اتلوحظ رعاش في الإيد."
  },
  {
    "word": "paralysis",
    "ipa": "[pəˈræləsɪs] (پارَلِسِس)",
    "meaning": "الشلل",
    "category": "neuro_sensory",
    "exampleEn": "The stroke caused partial paralysis.",
    "exampleAr": "السكتة الدماغية سببت شلل جزئي."
  },
  {
    "word": "blurred speech (slurred speech)",
    "ipa": "[slɜːrd spiːtʃ] (سلِرد سپيتش)",
    "meaning": "تلعثم/تداخل الكلام",
    "category": "neuro_sensory",
    "exampleEn": "Slurred speech is a stroke warning sign.",
    "exampleAr": "تداخل الكلام علامة تحذيرية للسكتة الدماغية."
  },
  {
    "word": "power of attorney",
    "ipa": "[ˈpaʊər əv əˈtɜːrni] (پاوَر أوف أتِرني)",
    "meaning": "توكيل قانوني",
    "category": "legal_documentation",
    "exampleEn": "His son has power of attorney.",
    "exampleAr": "ابنه عنده توكيل قانوني."
  },
  {
    "word": "advance directive",
    "ipa": "[ədˈvæns dɪˈrektɪv] (أدڤانس دايركتِڤ)",
    "meaning": "التوجيه المسبق (رغبات المريض)",
    "category": "legal_documentation",
    "exampleEn": "She has an advance directive on file.",
    "exampleAr": "عندها توجيه مسبق مسجّل."
  },
  {
    "word": "confidentiality",
    "ipa": "[ˌkɒnfɪˌdenʃiˈæləti] (كونفِدِنشياليتي)",
    "meaning": "السرية الطبية",
    "category": "legal_documentation",
    "exampleEn": "Patient confidentiality must be maintained.",
    "exampleAr": "لازم الحفاظ على السرية الطبية للمريض."
  },
  {
    "word": "leukemia",
    "ipa": "[luːˈkiːmiə] (لوكيميا)",
    "meaning": "سرطان الدم",
    "category": "hematology",
    "exampleEn": "He was diagnosed with leukemia last year.",
    "exampleAr": "اتشخّص بسرطان الدم السنة اللي فاتت."
  },
  {
    "word": "clotting",
    "ipa": "[ˈklɒtɪŋ] (كلوتِنج)",
    "meaning": "تخثّر الدم",
    "category": "hematology",
    "exampleEn": "Blood clotting time was checked.",
    "exampleAr": "وقت تخثّر الدم اتفحص."
  },
  {
    "word": "platelet",
    "ipa": "[ˈpleɪtlət] (پليتلِت)",
    "meaning": "الصفيحة الدموية",
    "category": "hematology",
    "exampleEn": "His platelet count is low.",
    "exampleAr": "عدد الصفائح الدموية عنده قليل."
  },
  {
    "word": "blood type",
    "ipa": "[blʌd taɪp] (بلَد تايپ)",
    "meaning": "فصيلة الدم",
    "category": "hematology",
    "exampleEn": "Check his blood type before transfusion.",
    "exampleAr": "افحص فصيلة دمه قبل نقل الدم."
  },
  {
    "word": "bruising easily",
    "ipa": "[ˈbruːzɪŋ ˈiːzəli] (بروزِنج إيزِلي)",
    "meaning": "الكدمات بسهولة",
    "category": "hematology",
    "exampleEn": "She reported bruising easily.",
    "exampleAr": "أبلغت عن ظهور كدمات بسهولة."
  },
  {
    "word": "cataract",
    "ipa": "[ˈkætərækt] (كاتَراكت)",
    "meaning": "الماء الأبيض (الساد)",
    "category": "ophthalmology_more",
    "exampleEn": "He had cataract surgery last month.",
    "exampleAr": "اتعمل عملية ماء أبيض الشهر اللي فات."
  },
  {
    "word": "glaucoma",
    "ipa": "[ɡlɔːˈkoʊmə] (جلوكوما)",
    "meaning": "الماء الأزرق (الجلوكوما)",
    "category": "ophthalmology_more",
    "exampleEn": "Glaucoma can lead to vision loss.",
    "exampleAr": "الجلوكوما ممكن تؤدي لفقدان الرؤية."
  },
  {
    "word": "eye drops",
    "ipa": "[aɪ drɒps] (آي دروپس)",
    "meaning": "قطرة العين",
    "category": "ophthalmology_more",
    "exampleEn": "Use the eye drops twice daily.",
    "exampleAr": "استخدم قطرة العين مرتين يوميًا."
  },
  {
    "word": "toothache",
    "ipa": "[ˈtuːθeɪk] (توث-إيك)",
    "meaning": "ألم الأسنان",
    "category": "dental",
    "exampleEn": "He came in with a severe toothache.",
    "exampleAr": "جه بألم أسنان شديد."
  },
  {
    "word": "cavity",
    "ipa": "[ˈkævəti] (كافِتي)",
    "meaning": "تسوّس الأسنان",
    "category": "dental",
    "exampleEn": "The dentist found a cavity.",
    "exampleAr": "دكتور الأسنان لقى تسوّس."
  },
  {
    "word": "gum disease",
    "ipa": "[ɡʌm dɪˈziːz] (جَم دِزيز)",
    "meaning": "أمراض اللثة",
    "category": "dental",
    "exampleEn": "Gum disease can affect overall health.",
    "exampleAr": "أمراض اللثة ممكن تأثر على الصحة العامة."
  },
  {
    "word": "interpreter",
    "ipa": "[ɪnˈtɜːrprɪtər] (إنتِرپرِتَر)",
    "meaning": "المترجم الفوري",
    "category": "interpreter_communication",
    "exampleEn": "We need an interpreter for this patient.",
    "exampleAr": "محتاجين مترجم فوري للمريض ده."
  },
  {
    "word": "language barrier",
    "ipa": "[ˈlæŋɡwɪdʒ ˈbæriər] (لانجويج باريَر)",
    "meaning": "حاجز اللغة",
    "category": "interpreter_communication",
    "exampleEn": "A language barrier can affect care.",
    "exampleAr": "حاجز اللغة ممكن يأثر على الرعاية."
  },
  {
    "word": "Can you repeat that, please?",
    "ipa": "[kæn juː rɪˈpiːt ðæt pliːz] (كان يو رِپيت ذات پليز)",
    "meaning": "ممكن تعيد تاني لو سمحت؟",
    "category": "interpreter_communication",
    "exampleEn": "Can you repeat that, please? I didn't catch it.",
    "exampleAr": "ممكن تعيد تاني؟ مسمعتش كويس."
  },
  {
    "word": "consent for procedure",
    "ipa": "[kənˈsent fɔːr prəˈsiːdʒər] (كونسِنت فور پروسيجَر)",
    "meaning": "الموافقة على الإجراء",
    "category": "pre_post_test",
    "exampleEn": "We need consent for the procedure.",
    "exampleAr": "محتاجين موافقة على الإجراء."
  },
  {
    "word": "sedation",
    "ipa": "[sɪˈdeɪʃən] (سِديشِن)",
    "meaning": "التخدير الخفيف/التسكين",
    "category": "pre_post_test",
    "exampleEn": "Light sedation was used for the endoscopy.",
    "exampleAr": "استُخدم تخدير خفيف للمنظار."
  },
  {
    "word": "recovery time",
    "ipa": "[rɪˈkʌvəri taɪm] (رِكَڤَري تايم)",
    "meaning": "وقت التعافي",
    "category": "pre_post_test",
    "exampleEn": "Recovery time varies by patient.",
    "exampleAr": "وقت التعافي بيختلف من مريض للتاني."
  },
  {
    "word": "trimester",
    "ipa": "[traɪˈmestər] (تراي-مِستَر)",
    "meaning": "الثلث (من الحمل)",
    "category": "pregnancy_more",
    "exampleEn": "She is in her third trimester.",
    "exampleAr": "هي في الثلث الأخير من الحمل."
  },
  {
    "word": "ultrasound scan (pregnancy)",
    "ipa": "[ˈʌltrəsaʊnd skæn] (ألترا-ساوند سكان)",
    "meaning": "أشعة الحمل",
    "category": "pregnancy_more",
    "exampleEn": "The ultrasound scan confirmed the due date.",
    "exampleAr": "أشعة الحمل أكّدت ميعاد الولادة."
  },
  {
    "word": "due date",
    "ipa": "[djuː deɪt] (ديو ديت)",
    "meaning": "الموعد المتوقع للولادة",
    "category": "pregnancy_more",
    "exampleEn": "Her due date is next month.",
    "exampleAr": "موعد ولادتها المتوقع الشهر الجاي."
  },
  {
    "word": "epidural",
    "ipa": "[ˌepɪˈdjʊərəl] (إپِديورَل)",
    "meaning": "إبرة الظهر (تخدير الولادة)",
    "category": "pregnancy_more",
    "exampleEn": "She requested an epidural during labor.",
    "exampleAr": "طلبت إبرة الظهر أثناء المخاض."
  },
  {
    "word": "It's okay to feel scared.",
    "ipa": "[ɪts oʊˈkeɪ tuː fiːl skerd] (إتس أوكي تو فيل سكيرد)",
    "meaning": "عادي إنك تحس بالخوف.",
    "category": "emotional_support_more",
    "exampleEn": "It's okay to feel scared before surgery.",
    "exampleAr": "عادي إنك تحس بالخوف قبل العملية."
  },
  {
    "word": "We're here for you.",
    "ipa": "[wɪr hɪr fɔːr juː] (وير هير فور يو)",
    "meaning": "إحنا موجودين معاك.",
    "category": "emotional_support_more",
    "exampleEn": "We're here for you every step of the way.",
    "exampleAr": "إحنا موجودين معاك في كل خطوة."
  },
  {
    "word": "Take your time.",
    "ipa": "[teɪk jʊər taɪm] (تيك يور تايم)",
    "meaning": "خد وقتك.",
    "category": "emotional_support_more",
    "exampleEn": "Take your time, there's no rush.",
    "exampleAr": "خد وقتك، مفيش استعجال."
  },
  {
    "word": "dietitian",
    "ipa": "[ˌdaɪəˈtɪʃən] (دايَتِشِن)",
    "meaning": "أخصائي التغذية",
    "category": "healthcare_team",
    "exampleEn": "The dietitian planned his meal schedule.",
    "exampleAr": "أخصائي التغذية حط له جدول الوجبات."
  },
  {
    "word": "radiologist",
    "ipa": "[ˌreɪdiˈɒlədʒɪst] (ريديولوجِست)",
    "meaning": "أخصائي الأشعة",
    "category": "healthcare_team",
    "exampleEn": "The radiologist reviewed the scan.",
    "exampleAr": "أخصائي الأشعة راجع الأشعة."
  },
  {
    "word": "anesthetist",
    "ipa": "[əˈniːsθətɪst] (أنيسثِتِست)",
    "meaning": "أخصائي التخدير",
    "category": "healthcare_team",
    "exampleEn": "The anesthetist explained the sedation options.",
    "exampleAr": "أخصائي التخدير شرح خيارات التخدير."
  },
  {
    "word": "social worker",
    "ipa": "[ˈsoʊʃəl ˈwɜːrkər] (سوشَل وِركَر)",
    "meaning": "الأخصائي الاجتماعي",
    "category": "healthcare_team",
    "exampleEn": "A social worker will assist with discharge planning.",
    "exampleAr": "أخصائي اجتماعي هيساعد في تخطيط الخروج."
  },
  {
    "word": "case manager",
    "ipa": "[keɪs ˈmænɪdʒər] (كيس مانِجَر)",
    "meaning": "مدير الحالة",
    "category": "healthcare_team",
    "exampleEn": "The case manager coordinates his care.",
    "exampleAr": "مدير الحالة بينسّق رعايته."
  },
  {
    "word": "Do you understand the instructions?",
    "ipa": "[duː juː ˌʌndərˈstænd ðə ɪnˈstrʌkʃənz] (دو يو أندِرستاند ذا إنسترَكشِنز)",
    "meaning": "فاهم التعليمات؟",
    "category": "education_phrases_more",
    "exampleEn": "Do you understand the instructions I gave you?",
    "exampleAr": "فاهم التعليمات اللي قولتهالك؟"
  },
  {
    "word": "Let me explain again.",
    "ipa": "[let miː ɪkˈspleɪn əˈɡen] (ليت مي إكسپلين أجين)",
    "meaning": "خليني أشرحلك تاني.",
    "category": "education_phrases_more",
    "exampleEn": "Let me explain again more slowly.",
    "exampleAr": "خليني أشرحلك تاني بشكل أبطأ."
  },
  {
    "word": "Show me how you would do it.",
    "ipa": "[ʃoʊ miː haʊ juː wʊd duː ɪt] (شو مي هاو يو وود دو إت)",
    "meaning": "ورّيني هتعمله إزاي.",
    "category": "education_phrases_more",
    "exampleEn": "Show me how you would do it at home.",
    "exampleAr": "ورّيني هتعمله إزاي في البيت."
  },
  {
    "word": "chest tightness",
    "ipa": "[tʃest ˈtaɪtnəs] (تشِست تايتنِس)",
    "meaning": "ضيق في الصدر",
    "category": "critical_warning_signs",
    "exampleEn": "He reported chest tightness.",
    "exampleAr": "أبلغ عن ضيق في الصدر."
  },
  {
    "word": "sudden weakness",
    "ipa": "[ˈsʌdən ˈwiːknəs] (سَدِن ويكنِس)",
    "meaning": "ضعف مفاجئ",
    "category": "critical_warning_signs",
    "exampleEn": "Sudden weakness on one side is a stroke sign.",
    "exampleAr": "الضعف المفاجئ في جهة واحدة علامة سكتة دماغية."
  },
  {
    "word": "difficulty speaking",
    "ipa": "[ˈdɪfɪkəlti ˈspiːkɪŋ] (دِفِكَلتي سپيكِنج)",
    "meaning": "صعوبة في الكلام",
    "category": "critical_warning_signs",
    "exampleEn": "Difficulty speaking requires urgent attention.",
    "exampleAr": "صعوبة الكلام محتاجة اهتمام عاجل."
  },
  {
    "word": "loss of consciousness",
    "ipa": "[lɒs əv ˈkɒnʃəsnəs] (لوس أوف كونشَسنِس)",
    "meaning": "فقدان الوعي",
    "category": "critical_warning_signs",
    "exampleEn": "He had a brief loss of consciousness.",
    "exampleAr": "حصله فقدان وعي بسيط."
  },
  {
    "word": "Do you smoke?",
    "ipa": "[duː juː smoʊk] (دو يو سموك)",
    "meaning": "بتدخّن؟",
    "category": "health_survey_phrases",
    "exampleEn": "Do you smoke or drink alcohol?",
    "exampleAr": "بتدخّن أو تشرب كحول؟"
  },
  {
    "word": "Any known allergies?",
    "ipa": "[ˈeni noʊn ˈælərdʒiz] (إني نون أليرجيز)",
    "meaning": "عندك أي حساسية معروفة؟",
    "category": "health_survey_phrases",
    "exampleEn": "Any known allergies to medication?",
    "exampleAr": "عندك أي حساسية معروفة من أدوية؟"
  },
  {
    "word": "Are you currently taking any medication?",
    "ipa": "[ɑːr juː ˈkʌrəntli ˈteɪkɪŋ ˈeni ˌmedɪˈkeɪʃən] (آر يو كَرِنتلي تيكِنج إني مِدِكيشِن)",
    "meaning": "بتاخد أي دواء حاليًا؟",
    "category": "health_survey_phrases",
    "exampleEn": "Are you currently taking any medication regularly?",
    "exampleAr": "بتاخد أي دواء بانتظام حاليًا؟"
  },
  {
    "word": "head injury",
    "ipa": "[hed ˈɪndʒəri] (هِد إنجَري)",
    "meaning": "إصابة في الرأس",
    "category": "injuries_accidents",
    "exampleEn": "He suffered a head injury in the accident.",
    "exampleAr": "أصيب في رأسه في الحادثة."
  },
  {
    "word": "concussion",
    "ipa": "[kənˈkʌʃən] (كونكَشِن)",
    "meaning": "ارتجاج في المخ",
    "category": "injuries_accidents",
    "exampleEn": "The doctor suspects a concussion.",
    "exampleAr": "الدكتور بيشك في ارتجاج مخي."
  },
  {
    "word": "whiplash",
    "ipa": "[ˈwɪplæʃ] (ويپلاش)",
    "meaning": "إصابة الرقبة (اهتزازية)",
    "category": "injuries_accidents",
    "exampleEn": "She has whiplash from the car accident.",
    "exampleAr": "عندها إصابة رقبة من حادثة السيارة."
  },
  {
    "word": "puncture wound",
    "ipa": "[ˈpʌŋktʃər wuːnd] (پَنكتشَر ووند)",
    "meaning": "جرح ثقبي",
    "category": "injuries_accidents",
    "exampleEn": "He has a puncture wound on his foot.",
    "exampleAr": "عنده جرح ثقبي في رجله."
  },
  {
    "word": "road traffic accident",
    "ipa": "[roʊd ˈtræfɪk ˈæksɪdənt] (رود ترافِك أكسِدِنت)",
    "meaning": "حادثة مرورية",
    "category": "injuries_accidents",
    "exampleEn": "He was brought in after a road traffic accident.",
    "exampleAr": "اتنقل بعد حادثة مرورية."
  },
  {
    "word": "gluten intolerance",
    "ipa": "[ˈɡluːtən ɪnˈtɒlərəns] (جلوتِن إنتولَرَنس)",
    "meaning": "عدم تحمّل الجلوتين",
    "category": "food_allergies",
    "exampleEn": "She has gluten intolerance.",
    "exampleAr": "عندها عدم تحمّل للجلوتين."
  },
  {
    "word": "lactose intolerance",
    "ipa": "[ˈlæktoʊs ɪnˈtɒlərəns] (لاكتوس إنتولَرَنس)",
    "meaning": "عدم تحمّل اللاكتوز",
    "category": "food_allergies",
    "exampleEn": "He avoids dairy due to lactose intolerance.",
    "exampleAr": "بيتجنّب الألبان بسبب عدم تحمّل اللاكتوز."
  },
  {
    "word": "nut allergy",
    "ipa": "[nʌt ˈælərdʒi] (نَت أليرجي)",
    "meaning": "حساسية المكسرات",
    "category": "food_allergies",
    "exampleEn": "Check for a nut allergy before serving food.",
    "exampleAr": "افحص حساسية المكسرات قبل تقديم الأكل."
  },
  {
    "word": "circulation",
    "ipa": "[ˌsɜːrkjəˈleɪʃən] (سِركيوليشِن)",
    "meaning": "الدورة الدموية",
    "category": "vital_processes",
    "exampleEn": "Poor circulation causes cold hands.",
    "exampleAr": "ضعف الدورة الدموية بيسبب برودة الإيدين."
  },
  {
    "word": "digestion",
    "ipa": "[daɪˈdʒestʃən] (دايجِستشِن)",
    "meaning": "الهضم",
    "category": "vital_processes",
    "exampleEn": "Slow digestion can cause bloating.",
    "exampleAr": "الهضم البطيء ممكن يسبب انتفاخ."
  },
  {
    "word": "perspiration",
    "ipa": "[ˌpɜːrspəˈreɪʃən] (پِرسپِريشِن)",
    "meaning": "التعرّق",
    "category": "vital_processes",
    "exampleEn": "Excessive perspiration was noted.",
    "exampleAr": "اتلوحظ تعرّق زايد."
  },
  {
    "word": "workshop",
    "ipa": "[ˈwɜːrkʃɒp] (ورك-شوپ)",
    "meaning": "ورشة عمل",
    "category": "continuing_education",
    "exampleEn": "She attended a wound care workshop.",
    "exampleAr": "حضرت ورشة عمل عن العناية بالجروح."
  },
  {
    "word": "certification",
    "ipa": "[ˌsɜːrtɪfɪˈkeɪʃən] (سِرتِفِكيشِن)",
    "meaning": "الشهادة/الاعتماد",
    "category": "continuing_education",
    "exampleEn": "He completed his CPR certification.",
    "exampleAr": "خلّص شهادة الإنعاش القلبي الرئوي."
  },
  {
    "word": "competency",
    "ipa": "[ˈkɒmpɪtənsi] (كومپِتِنسي)",
    "meaning": "الكفاءة المهنية",
    "category": "continuing_education",
    "exampleEn": "Nurses must maintain clinical competency.",
    "exampleAr": "الممرضين لازم يحافظوا على كفاءتهم الإكلينيكية."
  },
  {
    "word": "electronic health record (EHR)",
    "ipa": "[ɪˌlekˈtrɒnɪk helθ ˈrekərd] (إليكترونِك هِلث رِكورد)",
    "meaning": "الملف الصحي الإلكتروني",
    "category": "medical_technology",
    "exampleEn": "All notes are entered into the EHR.",
    "exampleAr": "كل الملاحظات بتتسجّل في الملف الإلكتروني."
  },
  {
    "word": "telehealth",
    "ipa": "[ˈtelihelθ] (تيلي-هِلث)",
    "meaning": "الرعاية الصحية عن بُعد",
    "category": "medical_technology",
    "exampleEn": "The consultation was done via telehealth.",
    "exampleAr": "الاستشارة اتعملت عن بُعد."
  },
  {
    "word": "barcode scanning",
    "ipa": "[ˈbɑːrkoʊd ˈskænɪŋ] (باركود سكانِنج)",
    "meaning": "مسح الباركود (للأدوية)",
    "category": "medical_technology",
    "exampleEn": "Barcode scanning prevents medication errors.",
    "exampleAr": "مسح الباركود بيمنع أخطاء الأدوية."
  },
  {
    "word": "priority",
    "ipa": "[praɪˈɒrəti] (برايوريتي)",
    "meaning": "الأولوية",
    "category": "prioritization",
    "exampleEn": "This patient is a high priority.",
    "exampleAr": "المريض ده أولوية عالية."
  },
  {
    "word": "multitasking",
    "ipa": "[ˌmʌltiˈtæskɪŋ] (مَلتي-تاسكِنج)",
    "meaning": "تعدد المهام",
    "category": "prioritization",
    "exampleEn": "Nursing requires excellent multitasking skills.",
    "exampleAr": "التمريض محتاج مهارات تعدد مهام ممتازة."
  },
  {
    "word": "time management",
    "ipa": "[taɪm ˈmænɪdʒmənt] (تايم مانِجمِنت)",
    "meaning": "إدارة الوقت",
    "category": "prioritization",
    "exampleEn": "Good time management reduces stress.",
    "exampleAr": "إدارة الوقت الكويسة بتقلل التوتر."
  },
  {
    "word": "Is there anything else you'd like to ask?",
    "ipa": "[ɪz ðer ˈeniθɪŋ els juːd laɪk tuː ɑːsk] (إز ذير إني ثينج إلس يود لايك تو آسك)",
    "meaning": "فيه حاجة تانية عايز تسأل عنها؟",
    "category": "closing_phrases",
    "exampleEn": "Is there anything else you'd like to ask before you leave?",
    "exampleAr": "فيه حاجة تانية عايز تسأل عنها قبل ما تمشي؟"
  },
  {
    "word": "We'll see you at your next visit.",
    "ipa": "[wiːl siː juː æt jʊər nekst ˈvɪzɪt] (ويل سي يو آت يور نِكست ڤِزِت)",
    "meaning": "هنشوفك في زيارتك الجاية.",
    "category": "closing_phrases",
    "exampleEn": "We'll see you at your next visit in two weeks.",
    "exampleAr": "هنشوفك في زيارتك الجاية بعد أسبوعين."
  },
  {
    "word": "Get well soon.",
    "ipa": "[ɡet wel suːn] (جِت ويل سون)",
    "meaning": "سلامتك.",
    "category": "closing_phrases",
    "exampleEn": "Get well soon and take care.",
    "exampleAr": "سلامتك واعتني بنفسك."
  },
  {
    "word": "blood culture",
    "ipa": "[blʌd ˈkʌltʃər] (بلَد كَلتشَر)",
    "meaning": "مزرعة دم",
    "category": "lab_values",
    "exampleEn": "A blood culture will identify the infection source.",
    "exampleAr": "مزرعة الدم هتحدد مصدر العدوى."
  },
  {
    "word": "wound culture",
    "ipa": "[wuːnd ˈkʌltʃər] (ووند كَلتشَر)",
    "meaning": "مزرعة الجرح",
    "category": "lab_values",
    "exampleEn": "A wound culture was sent to the lab.",
    "exampleAr": "مزرعة الجرح اتبعتت للمعمل."
  },
  {
    "word": "electrolytes",
    "ipa": "[ɪˈlektrəlaɪts] (إليكترولايتس)",
    "meaning": "الأملاح المعدنية بالدم",
    "category": "lab_values",
    "exampleEn": "Electrolytes were within normal range.",
    "exampleAr": "الأملاح المعدنية كانت ضمن المعدل الطبيعي."
  },
  {
    "word": "creatinine",
    "ipa": "[kriˈætɪniːn] (كرياتِنين)",
    "meaning": "الكرياتينين (مؤشر وظائف الكلى)",
    "category": "lab_values",
    "exampleEn": "His creatinine level indicates kidney function.",
    "exampleAr": "مستوى الكرياتينين بيدل على وظائف الكلى."
  },
  {
    "word": "bilirubin",
    "ipa": "[ˌbɪlɪˈruːbɪn] (بِلي-روبِن)",
    "meaning": "البيليروبين",
    "category": "lab_values",
    "exampleEn": "Elevated bilirubin causes jaundice.",
    "exampleAr": "ارتفاع البيليروبين بيسبب يرقان."
  },
  {
    "word": "clinic",
    "ipa": "[ˈklɪnɪk] (كلينِك)",
    "meaning": "العيادة",
    "category": "departments",
    "exampleEn": "The clinic opens at 9 AM.",
    "exampleAr": "العيادة بتفتح الساعة 9 الصبح."
  },
  {
    "word": "burn unit",
    "ipa": "[bɜːrn ˈjuːnɪt] (بِرن يونِت)",
    "meaning": "وحدة الحروق",
    "category": "departments",
    "exampleEn": "He was transferred to the burn unit.",
    "exampleAr": "اتنقل لوحدة الحروق."
  },
  {
    "word": "dialysis unit",
    "ipa": "[daɪˈæləsɪs ˈjuːnɪt] (دايالِسِس يونِت)",
    "meaning": "وحدة الغسيل الكلوي",
    "category": "departments",
    "exampleEn": "She visits the dialysis unit three times a week.",
    "exampleAr": "بتروح وحدة الغسيل الكلوي 3 مرات أسبوعيًا."
  },
  {
    "word": "nursery",
    "ipa": "[ˈnɜːrsəri] (نِرسَري)",
    "meaning": "حضانة المواليد",
    "category": "departments",
    "exampleEn": "The newborn is in the nursery.",
    "exampleAr": "المولود في حضانة المواليد."
  },
  {
    "word": "physical therapy department",
    "ipa": "[ˈfɪzɪkəl ˈθerəpi dɪˈpɑːrtmənt] (فِزِكَل ثيرَپي دِپارتمِنت)",
    "meaning": "قسم العلاج الطبيعي",
    "category": "departments",
    "exampleEn": "He was referred to the physical therapy department.",
    "exampleAr": "اتحوّل لقسم العلاج الطبيعي."
  },
  {
    "word": "hydrocephalus",
    "ipa": "[ˌhaɪdroʊˈsefələs] (هايدرو-سِفَلَس)",
    "meaning": "استسقاء الدماغ",
    "category": "diseases",
    "exampleEn": "Hydrocephalus was diagnosed in infancy.",
    "exampleAr": "استسقاء الدماغ اتشخّص من الرضاعة."
  },
  {
    "word": "shingles",
    "ipa": "[ˈʃɪŋɡəlz] (شِنجِلز)",
    "meaning": "الحزام الناري",
    "category": "diseases",
    "exampleEn": "He developed shingles after stress.",
    "exampleAr": "ظهرله حزام ناري بعد ضغط نفسي."
  },
  {
    "word": "measles",
    "ipa": "[ˈmiːzəlz] (ميزِلز)",
    "meaning": "الحصبة",
    "category": "diseases",
    "exampleEn": "Measles is highly contagious.",
    "exampleAr": "الحصبة معدية جدًا."
  },
  {
    "word": "chickenpox",
    "ipa": "[ˈtʃɪkənpɒks] (تشِكِن-پوكس)",
    "meaning": "جدري الماء",
    "category": "diseases",
    "exampleEn": "The child has chickenpox.",
    "exampleAr": "الطفل عنده جدري ماء."
  },
  {
    "word": "mumps",
    "ipa": "[mʌmps] (مَمپس)",
    "meaning": "النكاف",
    "category": "diseases",
    "exampleEn": "Mumps causes swollen glands.",
    "exampleAr": "النكاف بيسبب تورم الغدد."
  },
  {
    "word": "water intoxication",
    "ipa": "[ˈwɔːtər ɪnˌtɒksɪˈkeɪʃən] (ووتَر إنتوكسِكيشِن)",
    "meaning": "تسمم مائي",
    "category": "general_medical_more",
    "exampleEn": "Water intoxication is rare but serious.",
    "exampleAr": "التسمم المائي نادر لكنه خطير."
  },
  {
    "word": "halitosis",
    "ipa": "[ˌhælɪˈtoʊsɪs] (هالِتوسِس)",
    "meaning": "رائحة الفم الكريهة",
    "category": "general_medical_more",
    "exampleEn": "Halitosis can indicate gum disease.",
    "exampleAr": "رائحة الفم الكريهة ممكن تدل على مرض لثة."
  },
  {
    "word": "night sweats",
    "ipa": "[naɪt swets] (نايت سويتس)",
    "meaning": "التعرّق الليلي",
    "category": "symptoms",
    "exampleEn": "She has been having night sweats.",
    "exampleAr": "بتعاني من تعرّق ليلي."
  },
  {
    "word": "loss of appetite",
    "ipa": "[lɒs əv ˈæpɪtaɪt] (لوس أوف أپِتايت)",
    "meaning": "فقدان الشهية",
    "category": "symptoms",
    "exampleEn": "Loss of appetite is a common symptom.",
    "exampleAr": "فقدان الشهية عرض شائع."
  }
];
