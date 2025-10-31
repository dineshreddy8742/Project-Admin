import axios from 'axios';

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// Google Cloud Translation API configuration
const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Simple translation mappings for common responses
const translationMappings: { [key: string]: { [lang: string]: string } } = {
  // Common phrases that might be translated
  "heyhi tell me my name": {
    te: "హేయ్హి నా పేరు చెప్పు",
    hi: "हेहि मेरा नाम बताओ",
    ta: "ஹேஹி என் பெயரை சொல்",
    kn: "ಹೇಹಿ ನನ್ನ ಹೆಸರು ಹೇಳು",
    mr: "हेहि माझे नाव सांग",
    ml: "ഹേയ് എന്റെ പേര് പറ",
    ur: "heyhi میرا نام بتاؤ",
    gu: "હેહિ મને મારું નામ કહે",
    bn: "হেহি আমার নাম বলো",
    or: "ହେହି ମୋ ନାମ କୁହଣି",
    pa: "ਹੇਹਿ ਮੈਨੂੰ ਮੇਰਾ ਨਾਮ ਦੱਸੋ"
  },
  "tell me my name": {
    te: "నా పేరు చెప్పు",
    hi: "मुझे मेरा नाम बताओ",
    ta: "என் பெயரை சொல்",
    kn: "ನನ್ನ ಹೆಸರು ಹೇಳು",
    mr: "मला माझे नाव सांग",
    ml: "എന്റെ പേര് പറയൂ",
    ur: "مجھے میرا نام بتاؤ",
    gu: "મને મારું નામ કહે",
    bn: "আমার নাম বলো",
    or: "ମୋ ନାମ କହିବା",
    pa: "ਮੈਨੂੰ ਮੇਰਾ ਨਾਮ ਦੱਸੋ"
  },
  "supporting local artisans and preserving traditional crafts": {
    te: "స్థానిక కళాకారులను మద్దతించడం మరియు సాంప్రదాయిక క్రాఫ్ట్స్ ను కాపాడడం",
    hi: "स्थानीय कलाकारों का समर्थन करना और पारंपरिक शिल्पों को बनाए रखना",
    ta: "உள்ளூர் கலைஞர்களை ஆதரித்தல் மற்றும் பாரம்பரிய கைவினைகளை பாதுகாத்தல்",
    kn: "ಸ್ಥಳೀಯ ಕಲಾವಿದರನ್ನು ಬೆಂಬಲಿಸುವುದು ಮತ್ತು ಪಾರಂಪರಿಕ ಕೈವಾಡಗಳನ್ನು ಸಂರಕ್ಷಿಸುವುದು",
    mr: "स्थानिक कलाकारांना समर्थन देणे आणि पारंपारिक कामांचे संरक्षण करणे",
    ml: "പ്രാദേശിക കലാകാരന്മാരെ പിന്തുണയ്ക്കുക കൂടാതെ പാരമ്പര്യ കരാറുകള്‍ സംരക്ഷിക്കുക",
    ur: "مقامی کلیکاروں کی حمایت اور روایتی کرافٹس کو محفوظ کرنا",
    gu: "સ્થાનિક કલાકારોને આધાર આપવો અને પારંપરિક કારીગરીઓનું સંરક્ષણ કરવું",
    bn: "স্থানীয় শিল্পীদের সমর্থন করা এবং ঐতিহ্যবাহী শিল্পকে সংরক্ষণ করা",
    or: "ସ୍ଥାନୀୟ କଳାକାରମାନଙ୍କୁ ସମର୍ଥନ କରନ୍ତୁ ଏବଂ ଐତିହାସିକ କାରୁକାମମାନଙ୍କୁ ସଂରକ୍ଷଣ କରନ୍ତୁ",
    pa: "ਥਾਂ ਦੇ ਕਲਾਕਾਰਾਂ ਦੀ ਸਹਾਇਤਾ ਕਰੋ ਅਤੇ ਪਾਰੰਪਰਕ ਕਾਰਜਾਂ ਦੀ ਰੱਖਿਆ ਕਰੋ"
  },
  "Heritage Craft": {
    te: "వారసత్వ క్రాఫ్ట్",
    hi: "विरासत क्राफ्ट",
    ta: "பாரம்பரிய கைவினை",
    kn: "ಪಾರಂಪರಿಕ ಕೈವಾಡ",
    mr: "वारसदारी कामगिरी",
    ml: "പൈതൃക കർമ്മം",
    ur: "وراثت کرفٹ",
    gu: "વારસાગત કારીગરી",
    bn: "ঐতিহ্য শিল্প",
    or: "ଐତିହ୍ୟ ଶିଳ୍ପ",
    pa: "ਵਿਰਾਸਤੀ ਕਾਰਜ"
  },
  "Eco-Friendly": {
    te: "పర్యావరణ అనుకూల",
    hi: "पर्यावरण अनुकूल",
    ta: "சூழல் நட்பு",
    kn: "ಪರಿಸರ ಸ್ನೇಹಿ",
    mr: "पर्यावरणास अनुकूल",
    ml: "പരിസ്ഥിതി സൌഹൃദ്യം",
    ur: "ماحول دوست",
    gu: "પર્યાવરણ હિતાવહ",
    bn: "পরিবেশ বান্ধব",
    or: "ପରିବେଶ ବନ୍ଧୁ",
    pa: "ਪਰਸਰ ਹਿਤਕਾਰੀ"
  },
  "Support Local": {
    te: "స్థానికం చేయడాన్ని మద్దతించండి",
    hi: "स्थानीय का समर्थन करें",
    ta: "உள்ளூரை ஆதரிக்கவும்",
    kn: "ಸ್ಥಳೀಯವನ್ನು ಬೆಂಬಲಿಸಿ",
    mr: "स्थानिकाला पाठबंदी द्या",
    ml: "പ്രാദേശികതയെ പിന്തുണയ്ക്കുക",
    ur: "مقامی کی حمایت کریں",
    gu: "સ્થાનિકની આધાર આપો",
    bn: "স্থানীয় সমর্থন করুন",
    or: "ସ୍ଥାନୀୟମାନଙ୍କୁ ସମର୍ଥନ କରନ୍ତୁ",
    pa: "ਥਾਂ ਦੀ ਸਹਾਇਤਾ ਕਰੋ"
  },
  "Regional Pride": {
    te: "ప్రాంతీయ గర్వం",
    hi: "क्षेत्रीय गौरव",
    ta: "பிராந்தீய பெருமை",
    kn: "ಪ್ರಾದೇಶಿಕ ಹೆಮ್ಮೆ",
    mr: "प्रादेशिक अभिमान",
    ml: "പ്രാദേശിക അഭിമാനം",
    ur: "علاقائی فخر",
    gu: "પ્રાદેશિક ગૌરવ",
    bn: "আঞ্চলিক গর্ব",
    or: "ଅଞ୍ଚଳୀୟ ଗର୍ବ",
    pa: "ਖੇਤਰੀ ਗੌਰਵ"
  },
  "Supporting Local Artisans": {
    te: "స్థానిక కళాకారులను మద్దతించడం",
    hi: "स्थानीय कलाकारों का समर्थन करना",
    ta: "உள்ளூர் கலைஞர்களை ஆதரித்தல்",
    kn: "ಸ್ಥಳೀಯ ಕಲಾವಿದರನ್ನು ಬೆಂಬಲಿಸುವುದು",
    mr: "स्थानिक कलाकारांना समर्थन देणे",
    ml: "പ്രാദേശിക കലാകാരന്മാരെ പിന്തുണയ്ക്കുക",
    ur: "مقامی کلیکاروں کی حمایت",
    gu: "સ્થાનિક કલાકારોને આધાર આપવો",
    bn: "স্থানীয় শিল্পীদের সমর্থন",
    or: "ସ୍ଥାନୀୟ କଳାକାରମାନଙ୍କୁ ସମର୍ଥନ କରନ୍ତୁ",
    pa: "ਥਾਂ ਦੇ ਕਲਾਕਾਰਾਂ ਦੀ ਸਹਾਇਤਾ ਕਰੋ"
  },
  "Handcrafted with traditional techniques passed down through generations": {
    te: "తరతరాలుగా వచ్చే సాంప్రదాయిక పద్ధతులతో చేతితో చేసినవి",
    hi: "पीढ़ियों से चली आ रही पारंपरिक तकनीकों के साथ हस्तनिर्मित",
    ta: "சந்ததிகளாக கைமாறிய பாரம்பரிய நுட்பங்களுடன் கையால் செய்தவை",
    kn: "ಪೀಳ್ದಿಗಳಿಂದ ಪಾರಂಪರಿಕ ತಂತ್ರಜ್ಞಾನಗಳನ್ನು ಉಪಯೋಗಿಸಿ ಕೈಯಾರೆ ಮಾಡಲಾದವು",
    mr: "पिढ्यांनुसार वंशपरंपरागत पारंपारिक तंत्रज्ञानासह हाताने बनवलेले",
    ml: "തലമുറകളായി പാരമ്പര്യമായി വരുന്ന സാധാരണ സങ്കേതങ്ങളുപയോഗിച്ച് കൈകൊണ്ട് നിർമ്മിച്ചത്",
    ur: "ہاتھ سے تیار کردہ جو پارمپرک طریقہ کار کو نسل در نسل منتقل کیا گیا ہے",
    gu: "પરંપરાગત તકનીકો સાથે હાથથી બનાવેલ જે પેઢીઓથી ઉતરતી આવી છે",
    bn: "হস্তনির্মিত যা পরম্পরাগত পদ্ধতি ব্যবহার করে পুরুষপরপর সঞ্চারিত হয়েছে",
    or: "ହାତେଇ ନିର୍ମିତ ଯାହା ପରମ୍ପରାଗତ କାରିଗରି ଦ୍ୱାରା ପିଢ଼ିଯୁକ୍ତି ଆସିଛି",
    pa: "ਦਸਤੀ ਬਣਾਇਆ ਜੋ ਪੀੜ੍ਹੀਆਂ ਤੋਂ ਲੈ ਕੇ ਪਰੰਪਰਾਗਤ ਤਕਨੀਕਾਂ ਨਾਲ ਪਾਸ ਕੀਤਾ ਗਿਆ ਹੈ"
  },
  "I've opened the market trends page for tomato. Please select your location to see current prices.": {
    te: "టొమాటో కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "टमाटर के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "தக்காளிக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಟೊಮೆಟೊಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    mr: "टोमॅटोसाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "തക്കാളിക്കായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "ٹماٹر کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "ટોમેટો માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "টমেটোর জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "ଟମାଟର୍ ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਟਮਾਟਰ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  },
  "I've opened the market trends page for potato. Please select your location to see current prices.": {
    te: "బంగాళాదుంప కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "आलू के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "உருளைக்கிழங்குக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಆಲೂಗಡ್ಡೆಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    mr: "बटाट्यासाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "ഉരുളക്കിഴങ്ങിനായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "آلو کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "બટાકા માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "আলুর জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "ଆଲୁ ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਆਲੂ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  },
  "I've opened the market trends page for onion. Please select your location to see current prices.": {
    te: "ఉల్లిపాయ కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "प्याज के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "வெங்காயத்துக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಈರುಳ್ಳಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    mr: "कांद्यासाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "ഉള്ളിയ്ക്കായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "پیاز کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔"
  },
  "I've opened the market trends page for wheat. Please select your location to see current prices.": {
    te: "గోధుమల కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మી స్థానాన్ని ఎంచుకోండి.",
    hi: "गेहूं के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "கோதுமைக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಗೋಧಿ ಬೀಜಕ್ಕಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    mr: "गव्हासाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "ഗോതമ്പിനായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "گندم کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "ઘઉં માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "গমের জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "ଗହମ ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਗੇਹੁੰ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  },
  "I've opened the market trends page for rice. Please select your location to see current prices.": {
    te: "వరిగా కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "चावल के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "அரிசிக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಅಕ್ಕಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ్రಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ්ಕೆ ಮಾಡಿ.",
    mr: "तांदळासाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "അരിയ്ക്കായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "چاول کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "ચોખા માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "চালের জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "ଚାଉଳ ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਚਾਵਲ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  },
  "I've opened the market trends page for beans. Please select your location to see current prices.": {
    te: "బీన్స్ కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "बीन के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "பீன்ஸுக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಹುರಳಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    mr: "शेंगदाण्यासाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "ബീൻസിനായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ్థලം തിരഞ്ഞെടുക്കുക.",
    ur: "بینز کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "શેંગદાણા માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "বিনের জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "ବିନ୍ସ ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਬੀਨਜ਼ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  },
  "I've opened the market trends page for cabbage. Please select your location to see current prices.": {
    te: "కోసు కోసం మార్కెట్ ట్రెండ్స్ పేజీని తెరిచాను. ప్రస్తుత ధరలను చూడటానికి దయచేసి మీ స్థానాన్ని ఎంచుకోండి.",
    hi: "पत्तागोभी के लिए बाजार प्रवृत्ति पृष्ठ खोला है। वर्तमान कीमतें देखने के लिए कृपया अपना स्थान चुनें।",
    ta: "முட்டைக்கோசுக்கு சந்தை போக்குகள் பக்கத்தை திறந்துள்ளேன். தற்போதைய விலைகளைப் பார்க்க உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.",
    kn: "ಕೋಸುಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ. ಪ್ರಸ್ತುತ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ದയವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ്കೆ ಮಾಡಿ.",
    mr: "कोबीसाठी बाजार ट्रेंड पृष्ठ उघडले आहे. सद्य किंमती पाहण्यासाठी कृपया आपले स्थान निवडा.",
    ml: "മുളങ്കൊല്ലിനായി മാർക്കറ്റ് ട്രെൻഡ്സ് പേജ് തുറന്നു. നിലവിലെ വിലകൾ കാണാൻ ദയവായി നിങ്ങളുടെ സ്ഥലം തിരഞ്ഞെടുക്കുക.",
    ur: "پتہ گوبھی کے لیے مارکیٹ ٹرینڈز پیج کھولا ہے۔ موجودہ قیمتوں کو دیکھنے کے لیے براہ کرم اپنی جگہ منتخب کریں۔",
    gu: "કોબી માટે માર્કેટ ટ્રેન્ડ્સ પેજ ખોલ્યું છે. વર્તમાન કિંમતો જોવા માટે કૃપા કરીને તમારું સ્થાન પસંદ કરો.",
    bn: "কোবির জন্য মার্কেট ট্রেন্ডস পেজ খোলা হয়েছে। বর্তমান মূল্য দেখতে অনুগ্রহ করে আপনার অবস্থান নির্বাচন করুন।",
    or: "କୋବି ପାଇଁ ମାର୍କେଟ୍ ଟ୍ରେଣ୍ଡ୍ସ୍ ପେଜ୍ ଖୋଲା ହୋଇଛି। ବର୍ତ୍ତମାନ ମୂଲ୍ୟ ଦେଖିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚୟନ କରନ୍ତୁ।",
    pa: "ਕੋਬੀ ਲਈ ਮਾਰਕੀਟ ਟ੍ਰੈਂਡਜ਼ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਮੌਜੂਦਾ ਕੀਮਤਾਂ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਗ੍ਹਾ ਚੁਣੋ।"
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> => {
  try {
    const normalizedText = text.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Check if we have an exact pre-translated version for common responses (case-insensitive, normalized)
    if (translationMappings[normalizedText] && translationMappings[normalizedText][targetLanguage]) {
      console.log(`Using pre-translated text for: ${text} -> ${targetLanguage}`);
      return translationMappings[normalizedText][targetLanguage];
    }

    // If no API key is available, return original text or use any available mapping
    if (!API_KEY || API_KEY.trim() === '') {
      // Only log once per session to reduce console noise
      if (!window.translationWarningShown) {
        console.warn('Google Translate API key not configured. Using fallback translations. Add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file for full translation support.');
        window.translationWarningShown = true;
      }
      
      // Try to find a partial match in our mappings (more comprehensive search)
      for (const [key, translations] of Object.entries(translationMappings)) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, ' ');
        
        // Exact match after normalization
        if (normalizedText === normalizedKey) {
          console.log(`Using exact match mapping for: ${text} -> ${targetLanguage}`);
          return translations[targetLanguage] || text;
        }
        
        // Check if input contains the mapped phrase
        if (normalizedText.includes(normalizedKey)) {
          console.log(`Using partial match mapping for: ${text} -> ${targetLanguage}`);
          return translations[targetLanguage] || text;
        }
        
        // Check if mapped phrase contains the input (less likely but possible)
        if (normalizedKey.includes(normalizedText)) {
          console.log(`Using reverse partial match mapping for: ${text} -> ${targetLanguage}`);
          return translations[targetLanguage] || text;
        }
      }
      
      return text;
    }

    // For other texts, try to use Google Translate API
    console.log(`Translating via Google API: ${text} from ${sourceLanguage} to ${targetLanguage}`);
    const response = await axios.post(`${TRANSLATION_API_URL}?key=${API_KEY}`, {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    });

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    console.log('Falling back to original text:', text);
    
    // Try to return a mapped translation as a secondary fallback
    const normalizedText = text.trim().toLowerCase().replace(/\s+/g, ' ');
    
    if (translationMappings[normalizedText]?.[targetLanguage]) {
      return translationMappings[normalizedText][targetLanguage];
    }
    
    // Try to find a partial match in our mappings (more comprehensive search)
    for (const [key, translations] of Object.entries(translationMappings)) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, ' ');
      
      // Exact match after normalization
      if (normalizedText === normalizedKey) {
        console.log(`Using exact match mapping for: ${text} -> ${targetLanguage}`);
        return translations[targetLanguage] || text;
      }
      
      // Check if input contains the mapped phrase
      if (normalizedText.includes(normalizedKey)) {
        console.log(`Using partial match mapping for: ${text} -> ${targetLanguage}`);
        return translations[targetLanguage] || text;
      }
      
      // Check if mapped phrase contains the input (less likely but possible)
      if (normalizedKey.includes(normalizedText)) {
        console.log(`Using reverse partial match mapping for: ${text} -> ${targetLanguage}`);
        return translations[targetLanguage] || text;
      }
    }
    
    return text;
  }
};

export const translateMultipleTexts = async (
  texts: string[], 
  targetLanguage: string, 
  sourceLanguage: string = 'en'
): Promise<string[]> => {
  try {
  

    const response = await axios.post(`${TRANSLATION_API_URL}?key=${API_KEY}`, {
      q: texts,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    });

    return response.data.data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback to original texts if translation fails
    return texts;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  // Always use client-side detection first to avoid CORS issues
  return detectLanguageClientSide(text);
};

// Client-side language detection fallback
const detectLanguageClientSide = (text: string): string => {
  const lowerText = text.toLowerCase();

  // Check for Telugu words and script
  const teluguWords = ['oka', 'cheppa', 'cheppu', 'nenu', 'meeru', 'em', 'ela', 'joke', 'baba', 'kshaminchandi', 'nen', 'mi', 'ai', 'vyavasaya', 'sahayakudu', 'neti', 'avsaralalo', 'ela', 'sahayam', 'cheyagalnu', 'entha', 'undi', 'eroju', 'inka', 'kani', 'kada', 'ledu', 'undi', 'emundi', 'elaundi'];
  const teluguScript = /[\u0C00-\u0C7F]/.test(text);
  const teluguWordCount = teluguWords.filter(word => lowerText.includes(word)).length;

  if (teluguScript || teluguWordCount > 0) {
    return 'te';
  }

  // Check for Devanagari script (Hindi, Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    // Distinguish between Hindi and Marathi based on common words
    const marathiWords = ['मी', 'तुम्ही', 'आहे', 'आहेत', 'करीन', 'केली', 'होती'];
    const hindiWords = ['मैं', 'तुम', 'हूँ', 'हो', 'करता', 'किया', 'थी'];

    const marathiCount = marathiWords.filter(word => lowerText.includes(word)).length;
    const hindiCount = hindiWords.filter(word => lowerText.includes(word)).length;

    return marathiCount > hindiCount ? 'mr' : 'hi';
  }

  // Check for Tamil script and words
  const tamilWords = ['nan', 'neenga', 'enna', 'epdi', 'sol', 'sollunga', 'kshaminch', 'ai', 'velanmai', 'sahayak', 'indru', 'enakku', 'theliva'];
  const tamilScript = /[\u0B80-\u0BFF]/.test(text);
  const tamilWordCount = tamilWords.filter(word => lowerText.includes(word)).length;

  if (tamilScript || tamilWordCount > 0) {
    return 'ta';
  }

  // Check for Kannada script and words
  const kannadaWords = ['nanu', 'ninu', 'enu', 'hege', 'heli', 'kshaminch', 'ai', 'krsi', 'sahayak', 'indu', 'nann', 'gottu'];
  const kannadaScript = /[\u0C80-\u0CFF]/.test(text);
  const kannadaWordCount = kannadaWords.filter(word => lowerText.includes(word)).length;

  if (kannadaScript || kannadaWordCount > 0) {
    return 'kn';
  }

  // Check for Malayalam script and words
  const malayalamWords = ['nan', 'ningal', 'enna', 'eppol', 'paray', 'parayuka', 'kshaminch', 'ai', 'krsi', 'sahayak', 'indhu', 'enn', 'ariya'];
  const malayalamScript = /[\u0D00-\u0D7F]/.test(text);
  const malayalamWordCount = malayalamWords.filter(word => lowerText.includes(word)).length;

  if (malayalamScript || malayalamWordCount > 0) {
    return 'ml';
  }

  // Check for Urdu script and words
  const urduWords = ['main', 'aap', 'kya', 'kaise', 'bol', 'kshaminch', 'ai', 'krsi', 'madad', 'aaj', 'meri', 'samajh'];
  const urduScript = /[\u0600-\u06FF]/.test(text);
  const urduWordCount = urduWords.filter(word => lowerText.includes(word)).length;

  if (urduScript || urduWordCount > 0) {
    return 'ur';
  }

  // Check for common English words
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'hello', 'hi', 'good', 'morning', 'afternoon', 'evening'];
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;

  if (englishCount > 0) {
    return 'en';
  }

  // Default to English if no specific language detected
  return 'en';
};
