// قاموس إنجليزي طبي/تمريضي/صيدلي — بيانات ثابتة (مش محتاجة سيرفر ولا API)
// يُستخدم في صفحة English Pro كمرجع دائم للطالب يقدر يدوّر ويسمع فيه في أي وقت.
// المحتوى اتجمّع ونُظّم بالرجوع لمصطلحات OET/NCLEX/Nursing English المتداولة، وكل
// تعريف ومثال اتكتب من جديد بأسلوبنا (مش نسخ حرفي من أي مصدر).
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
  }
];
