/**
 * Every community development block in Bihar, district by district.
 *
 * Unlike the rest of the bundled place list this one is complete -- all 38
 * districts and their blocks -- because that is where the office admits from.
 * It is keyed by district alone, so lookups must ask for it by state: Bihar
 * and Maharashtra both have an Aurangabad.
 */
export const BIHAR_BLOCKS: Record<string, string[]> = {
  "Araria": ["Araria", "Bhargama", "Forbesganj", "Jokihat", "Kursakanta", "Narpatganj", "Palasi", "Raniganj", "Sikti"],
  "Arwal": ["Arwal", "Kaler", "Karpi", "Kurtha", "Sonbhadra Banshi Suryapur"],
  "Aurangabad": ["Aurangabad", "Barun", "Daudnagar", "Deo", "Goh", "Haspura", "Kutumba", "Madanpur", "Nabinagar", "Obra", "Rafiganj"],
  "Banka": ["Amarpur", "Banka", "Barahat", "Bausi", "Belhar", "Chandan", "Dhoraiya", "Fullidumar", "Katoria", "Rajoun", "Shambhuganj"],
  "Begusarai": ["Bachhwara", "Bakhri", "Balia", "Barauni", "Begusarai", "Bhagwanpur", "Birpur", "Cheria Bariarpur", "Chhorahi", "Dandari", "Garhpura", "Khodawandpur", "Mansurchak", "Matihani", "Naokothi", "Sahebpur Kamal", "Samho Akha Kurha", "Teghra"],
  "Bhagalpur": ["Bihpur", "Gopalpur", "Goradih", "Ismailpur", "Jagdishpur", "Kahalgaon", "Kharik", "Narayanpur", "Nathnagar", "Naugachhia", "Pirpainti", "Rangra Chowk", "Sabour", "Sanhaula", "Shahkund", "Sultanganj"],
  "Bhojpur": ["Agiaon", "Arrah", "Barhara", "Bihiya", "Charpokhari", "Garhani", "Jagdishpur", "Koilwar", "Piro", "Sahar", "Sandesh", "Shahpur", "Tarari", "Udwant Nagar"],
  "Buxar": ["Brahmpur", "Buxar", "Chakki", "Chaugain", "Chausa", "Dumraon", "Itarhi", "Kesath", "Nawanagar", "Rajpur", "Simri"],
  "Darbhanga": ["Alinagar", "Bahadurpur", "Baheri", "Benipur", "Biraul", "Darbhanga Sadar", "Gaura Bauram", "Ghanshyampur", "Hanuman Nagar", "Hayaghat", "Jale", "Keoti", "Kiratpur", "Kusheshwar Asthan", "Kusheshwar Asthan Purbi", "Manigachhi", "Singhwara", "Tardih"],
  "East Champaran": ["Adapur", "Areraj", "Banjaria", "Bankatwa", "Chakia", "Chhauradano", "Chiraiya", "Dhaka", "Ghorasahan", "Harsidhi", "Kalyanpur", "Kesariya", "Kotwa", "Madhuban", "Mehsi", "Motihari", "Paharpur", "Pakridayal", "Patahi", "Phenhara", "Piprakothi", "Ramgarhwa", "Raxaul", "Sangrampur", "Sugauli", "Tetaria", "Turkaulia"],
  "Gaya": ["Amas", "Atri", "Banke Bazar", "Barachatti", "Belaganj", "Bodh Gaya", "Dobhi", "Dumaria", "Fatehpur", "Gaya Town", "Guraru", "Gurua", "Imamganj", "Khizirsarai", "Konch", "Manpur", "Mohanpur", "Muhra", "Neemchak Bathani", "Paraiya", "Sherghati", "Tankuppa", "Tekari", "Wazirganj"],
  "Gopalganj": ["Baikunthpur", "Barauli", "Bhorey", "Bijaipur", "Gopalganj", "Hathua", "Kataiya", "Kuchaikote", "Manjha", "Panchdewari", "Phulwaria", "Sidhwalia", "Thawe", "Uchkagaon"],
  "Jamui": ["Barhat", "Chakai", "Gidhaur", "Islamnagar Aliganj", "Jamui", "Jhajha", "Khaira", "Laxmipur", "Sikandra", "Sono"],
  "Jehanabad": ["Ghoshi", "Hulasganj", "Jehanabad", "Kako", "Makhdumpur", "Modanganj", "Ratni Faridpur"],
  "Kaimur": ["Adhaura", "Bhabua", "Bhagwanpur", "Chainpur", "Chand", "Durgawati", "Kudra", "Mohania", "Nuaon", "Ramgarh", "Rampur"],
  "Katihar": ["Amdabad", "Azamnagar", "Balrampur", "Barari", "Barsoi", "Dandkhora", "Falka", "Hasanganj", "Kadwa", "Katihar", "Korha", "Kursela", "Manihari", "Mansahi", "Pranpur", "Sameli"],
  "Khagaria": ["Alauli", "Beldaur", "Chautham", "Gogri", "Khagaria", "Mansi", "Parbatta"],
  "Kishanganj": ["Bahadurganj", "Dighalbank", "Kishanganj", "Kochadhaman", "Pothia", "Terhagachh", "Thakurganj"],
  "Lakhisarai": ["Barahiya", "Channan", "Halsi", "Lakhisarai", "Pipariya", "Ramgarh Chowk", "Suryagarha"],
  "Madhepura": ["Alamnagar", "Bihariganj", "Chausa", "Gamharia", "Ghailarh", "Gwalpara", "Kumarkhand", "Madhepura", "Murliganj", "Puraini", "Shankarpur", "Singheshwar", "Uda Kishanganj"],
  "Madhubani": ["Andhratharhi", "Babubarhi", "Basopatti", "Benipatti", "Bisfi", "Ghoghardiha", "Harlakhi", "Jainagar", "Jhanjharpur", "Kaluahi", "Khajauli", "Khutauna", "Ladania", "Lakhnaur", "Laukahi", "Madhepur", "Madhwapur", "Pandaul", "Phulparas", "Rahika", "Rajnagar"],
  "Munger": ["Asarganj", "Bariyarpur", "Dharhara", "Haveli Kharagpur", "Jamalpur", "Munger Sadar", "Sangrampur", "Tarapur", "Tetiha Bambor"],
  "Muzaffarpur": ["Aurai", "Bandra", "Bochahan", "Gaighat", "Kanti", "Katra", "Kurhani", "Marwan", "Minapur", "Motipur", "Muraul", "Musahari", "Paroo", "Sahebganj", "Sakra", "Saraiya"],
  "Nalanda": ["Asthawan", "Ben", "Bihar Sharif", "Bind", "Chandi", "Ekangarsarai", "Giriyak", "Harnaut", "Hilsa", "Islampur", "Karai Parsurai", "Katrisarai", "Nagarnausa", "Noorsarai", "Parwalpur", "Rahui", "Rajgir", "Sarmera", "Silao", "Tharthari"],
  "Nawada": ["Akbarpur", "Govindpur", "Hisua", "Kashichak", "Kawakol", "Meskaur", "Nardiganj", "Narhat", "Nawada", "Pakribarawan", "Rajauli", "Roh", "Sirdala", "Warisaliganj"],
  "Patna": ["Athmalgola", "Bakhtiarpur", "Barh", "Belchhi", "Bihta", "Bikram", "Danapur", "Daniyawan", "Dhanarua", "Dulhin Bazar", "Fatuha", "Ghoswari", "Khusrupur", "Maner", "Masaurhi", "Mokama", "Naubatpur", "Paliganj", "Pandarak", "Patna Sadar", "Phulwari Sharif", "Punpun", "Sampatchak"],
  "Purnia": ["Amour", "Baisa", "Baisi", "Banmankhi", "Barhara Kothi", "Bhawanipur", "Dagarua", "Dhamdaha", "Jalalgarh", "Kasba", "Krityanand Nagar", "Purnia East", "Rupauli", "Srinagar"],
  "Rohtas": ["Akorhigola", "Bikramganj", "Chenari", "Dawath", "Dehri", "Dinara", "Karakat", "Kargahar", "Kochas", "Nasriganj", "Nauhatta", "Nokha", "Rajpur", "Rohtas", "Sanjhauli", "Sasaram", "Sheosagar", "Suryapura", "Tilouthu"],
  "Saharsa": ["Banma Itahari", "Kahara", "Mahishi", "Nauhatta", "Patarghat", "Salkhua", "Satar Kataiya", "Saur Bazar", "Simri Bakhtiarpur", "Sonbarsa"],
  "Samastipur": ["Bibhutipur", "Bithan", "Dalsinghsarai", "Hasanpur", "Kalyanpur", "Khanpur", "Mohanpur", "Mohiuddinnagar", "Morwa", "Patori", "Pusa", "Rosera", "Samastipur", "Sarairanjan", "Shivajinagar", "Singhia", "Tajpur", "Ujiyarpur", "Vidyapati Nagar", "Warisnagar"],
  "Saran": ["Amnour", "Baniyapur", "Chapra Sadar", "Dariyapur", "Dighwara", "Ekma", "Garkha", "Ishupur", "Jalalpur", "Lahladpur", "Maker", "Manjhi", "Marhaura", "Mashrakh", "Nagra", "Panapur", "Parsa", "Revelganj", "Sonepur", "Taraiya"],
  "Sheikhpura": ["Ariari", "Barbigha", "Chewara", "Ghatkusumbha", "Sheikhpura", "Shekhopur Sarai"],
  "Sheohar": ["Dumri Katsari", "Piprahi", "Purnahiya", "Sheohar", "Tariyani"],
  "Sitamarhi": ["Bairgania", "Bajpatti", "Bathnaha", "Belsand", "Bokhara", "Choraut", "Dumra", "Majorganj", "Nanpur", "Parihar", "Parsauni", "Pupri", "Riga", "Runnisaidpur", "Sonbarsa", "Suppi", "Sursand"],
  "Siwan": ["Andar", "Barharia", "Basantpur", "Bhagwanpur Hat", "Darauli", "Daraundha", "Goriakothi", "Guthani", "Hasanpura", "Hussainganj", "Lakri Nabiganj", "Maharajganj", "Mairwa", "Nautan", "Pachrukhi", "Raghunathpur", "Siswan", "Siwan", "Ziradei"],
  "Supaul": ["Basantpur", "Chhatapur", "Kishanpur", "Marauna", "Nirmali", "Pipra", "Pratapganj", "Raghopur", "Saraigarh Bhaptiyahi", "Supaul", "Tribeniganj"],
  "Vaishali": ["Bhagwanpur", "Bidupur", "Chehra Kalan", "Desari", "Goraul", "Hajipur", "Jandaha", "Lalganj", "Mahnar", "Mahua", "Patedhi Belsar", "Patepur", "Raghopur", "Rajapakar", "Sahdei Buzurg", "Vaishali"],
  "West Champaran": ["Bagaha-1", "Bagaha-2", "Bairia", "Bettiah", "Bhitaha", "Chanpatia", "Gaunaha", "Jogapatti", "Lauriya", "Madhubani", "Mainatand", "Majhaulia", "Narkatiaganj", "Nautan", "Piprasi", "Ramnagar", "Sikta", "Thakraha"],
};
