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
  }
];
