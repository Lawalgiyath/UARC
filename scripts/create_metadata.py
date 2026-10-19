import json
import os
from PIL import Image

# Read image sizes
folder = 'public/images/conference-2026'

gallery_data = [
  {
    "id": "dignitaries-group-1",
    "file": "MG_0976.jpg",
    "title": "Conference Dignitaries and Organizing Committee",
    "caption": "Prof. Nazmat Toyin Surajudeen-Bakinde (VC, USET The Gambia) and Prof. Muyiwa Falaiye (DVC Management Services) with members of the 19th UARC Organising Committee.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "plenary-presentation-vc-gambia",
    "file": "MG_0895.jpg",
    "title": "Plenary Address by Prof. Nazmat Toyin Surajudeen-Bakinde",
    "caption": "Vice-Chancellor of the University of Applied Science, Engineering and Technology (USET), The Gambia, delivering her plenary lecture on engineering and universities in tackling global challenges.",
    "category": "Plenary Sessions"
  },
  {
    "id": "dvc-falaiye-opening",
    "file": "MG_0858.jpg",
    "title": "Address by Deputy Vice-Chancellor Prof. Muyiwa Falaiye",
    "caption": "Deputy Vice-Chancellor (Management Services), Prof. Muyiwa Falaiye, representing the Vice-Chancellor Prof. Folasade Ogunsola, FAS, addressing the 19th Research Conference.",
    "category": "Plenary Sessions"
  },
  {
    "id": "plenary-hall-view",
    "file": "MG_0944.jpg",
    "title": "19th Research Conference Plenary Assembly",
    "caption": "Delegates, researchers, and dignitaries gathered at the plenary session in Jelili Adebisi Omotola Hall.",
    "category": "Conference Highlights"
  },
  {
    "id": "dignitaries-stage",
    "file": "MG_0950.jpg",
    "title": "High Table & University Leadership",
    "caption": "University of Lagos principal officers and distinguished guests presiding over the conference opening.",
    "category": "Conference Highlights"
  },
  {
    "id": "speaker-interaction",
    "file": "MG_0913.jpg",
    "title": "Engaging the Audience on Higher Education Innovation",
    "caption": "Prof. Surajudeen-Bakinde commending UNILAG's EIBIC entrepreneurship programme and its adoption as a national benchmark.",
    "category": "Plenary Sessions"
  },
  {
    "id": "falaiye-speech",
    "file": "MG_0853.jpg",
    "title": "Opening Remarks on Behalf of the Vice-Chancellor",
    "caption": "Prof. Muyiwa Falaiye expressing confidence in participants advancing sustainable frontiers for Africa's development.",
    "category": "Plenary Sessions"
  },
  {
    "id": "speaker-podium-view",
    "file": "MG_0918.jpg",
    "title": "Engineering & Technical Education Synergies",
    "caption": "Emphasizing the vital synergy between higher education, technical competence, and entrepreneurship.",
    "category": "Plenary Sessions"
  },
  {
    "id": "speaker-perspective",
    "file": "MG_0919.jpg",
    "title": "Institutionalising Entrepreneurship Education",
    "caption": "Applauding UNILAG for institutionalising entrepreneurship certification to foster student enterprise.",
    "category": "Plenary Sessions"
  },
  {
    "id": "plenary-session-engagement",
    "file": "MG_0922.jpg",
    "title": "Collaborative Ecosystems for Innovation",
    "caption": "Calling on universities to turn research ideas into tangible prototypes, patents, and community solutions.",
    "category": "Conference Highlights"
  },
  {
    "id": "hall-assembly",
    "file": "MG_0924.jpg",
    "title": "Distinguished Scholars and Participants",
    "caption": "Academics and conference delegates following the keynote presentation in Jelili Omotola Hall.",
    "category": "Conference Highlights"
  },
  {
    "id": "dvc-listening",
    "file": "MG_0863.jpg",
    "title": "Academic Leadership at the High Table",
    "caption": "Senior university management officers and deans during the opening ceremony.",
    "category": "Conference Highlights"
  },
  {
    "id": "high-table-dignitaries",
    "file": "MG_0867.jpg",
    "title": "Conference Chair & Senior Academics",
    "caption": "Members of university management and committee leadership at Jelili Adebisi Omotola Hall.",
    "category": "Conference Highlights"
  },
  {
    "id": "plenary-exchange",
    "file": "MG_0877-1.jpg",
    "title": "Presentation of Plenary Speaker",
    "caption": "Introduction of the plenary speaker from USET, The Gambia, by university officials.",
    "category": "Plenary Sessions"
  },
  {
    "id": "speaker-portrait",
    "file": "MG_0917-1.jpg",
    "title": "Prof. Nazmat Toyin Surajudeen-Bakinde",
    "caption": "Vice-Chancellor of the University of Applied Science, Engineering and Technology (USET), The Gambia.",
    "category": "Plenary Sessions"
  },
  {
    "id": "presentation-dialogue",
    "file": "MG_0933.jpg",
    "title": "Questions & Perspectives on African Higher Education",
    "caption": "Interactive discussion session following the plenary lecture.",
    "category": "Conference Highlights"
  },
  {
    "id": "discussion-point",
    "file": "MG_0936.jpg",
    "title": "Building Sustainable Frontiers",
    "caption": "Reflections on multi-disciplinary collaboration for health, food security, and housing.",
    "category": "Conference Highlights"
  },
  {
    "id": "delegates-group-2",
    "file": "MG_0973.jpg",
    "title": "Guest Speaker with University Leaders",
    "caption": "Commemorative photograph of Prof. Surajudeen-Bakinde and Prof. Falaiye with university officials.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-3",
    "file": "MG_0974.jpg",
    "title": "Conference Organizing Leaders & Guests",
    "caption": "Organising committee leadership, faculty deans, and distinguished guests celebrating the conference.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-4",
    "file": "MG_0975.jpg",
    "title": "Faculty Leadership & Committee Members",
    "caption": "Deans of Faculties and conference sub-committee leads in a commemorative group picture.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-5",
    "file": "MG_0977.jpg",
    "title": "Women Leaders in Higher Education & Research",
    "caption": "Prof. Surajudeen-Bakinde in a commemorative photograph with senior female scholars and executives.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-6",
    "file": "MG_0981.jpg",
    "title": "Academic Delegates and Scholars",
    "caption": "Scholars and presenters at the 19th UNILAG Annual Research Conference.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-7",
    "file": "MG_0984.jpg",
    "title": "Conference Delegates and Participants",
    "caption": "Delegates commemorating the successful plenary proceedings at the 19th edition.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-8",
    "file": "MG_0985.jpg",
    "title": "Research Presenters & Academic Staff",
    "caption": "Participants from diverse academic faculties across Nigerian and international institutions.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "delegates-group-9",
    "file": "MG_0989.jpg",
    "title": "Conference Committee and Protocol Team",
    "caption": "The organising and logistical support team for the 19th UNILAG Annual Research Conference.",
    "category": "Dignitaries & Groups"
  },
  {
    "id": "hall-delegates-wide",
    "file": "IMG-20261016-WA0003.jpg",
    "title": "Conference Delegation Assembly",
    "caption": "Participants gathered inside Jelili Adebisi Omotola Hall during the 19th Research Conference proceedings.",
    "category": "Dignitaries & Groups"
  }
]

# Enrich with image dimensions and paths
for item in gallery_data:
    path = os.path.join(folder, item['file'])
    thumb_path = os.path.join(folder, 'thumbs', item['file'])
    with Image.open(path) as img:
        item['width'], item['height'] = img.size
    item['fullSrc'] = f"/images/conference-2026/{item['file']}"
    item['thumbSrc'] = f"/images/conference-2026/thumbs/{item['file']}" if os.path.exists(thumb_path) else item['fullSrc']

os.makedirs('src/lib', exist_ok=True)
with open('src/lib/conferencePhotos.json', 'w', encoding='utf-8') as f:
    json.dump(gallery_data, f, indent=2)

print(f"Saved {len(gallery_data)} photo metadata entries to src/lib/conferencePhotos.json")
