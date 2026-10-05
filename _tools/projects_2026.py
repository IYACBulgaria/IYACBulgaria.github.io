"""
2026 projects that had no page on the old site. The text is taken word for word
from "IYAC Bulgaria – Project Summaries 2026" (Google Doc).

PLACEHOLDERS to replace when ready:
  - 'link': the Google Drive "Materials & Videos" link (for now it jumps to the gallery)
  - photos: assets/img/projects/<slug>/photo-1.jpg ... photo-9.jpg
  - poster: assets/img/home/posters/<slug>.jpg
Drop real files in with the same names, then run:
  python _tools/build_project.py && python _tools/i18n.py
"""

PLACEHOLDER_LINK = '#gallery'
PHOTOS = [f'photo-{i}' for i in range(1, 10)]
PLACEHOLDER_ALT = 'Photo coming soon'

PROJECTS_2026 = {
    'writethechange': {
        'title': 'Write the Change',
        'tagline': 'Erasmus+ project writing, from identifying community needs to applications, dissemination, evaluation and reporting',
        'facts': [('Dates', '8–16 May 2026'), ('Location', 'Youtopia Riverside guest house, Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Luxembourg, Poland, Romania, Moldova, Greece and Hungary'),
                  ('Format', 'Erasmus+ Training Course for youth workers')],
        'flags': ['bg', 'lu', 'pl', 'ro', 'md', 'gr', 'hu'],
        'meta': 'Training Course · May 2026',
        'paragraphs': [
            '"Write the Change" brought youth workers from seven countries to Stara Zagora for an Erasmus+ training course on how to design and write quality Erasmus+ projects. The course was built for a mixed group: experienced project writers working side by side with newcomers who had never prepared an application before. Its aim was to take participants through every stage of the project cycle, from identifying the real needs of young people in their communities to writing the application, planning dissemination, evaluating results and reporting.',
            'The first day was dedicated to building trust within the group. Through team-building activities, games and challenges, participants from Bulgaria, Luxembourg, Poland, Romania, Moldova, Greece and Hungary got to know each other and started forming the partnerships they would rely on for the rest of the week.',
            'On the second day, participants explored the range of opportunities the Erasmus+ programme offers to organisations and youth workers, from KA1 mobility projects to KA2 partnerships. Special attention went to Youth Participation Activities, Small-Scale Partnerships, cooperation projects and new ways for organisations to involve young people and local communities. Instead of only listening to presentations, participants presented the different funding formats to each other through short theatre-style performances, which made complex programme rules easier to understand and remember. In the afternoon the group turned to local realities: through debates, group research and discussion, they examined the social issues that affect young people in their countries and how an organisation can properly identify needs before designing a project.',
            "Day three took the training out of the classroom and into Plovdiv, one of the oldest continuously inhabited cities in Europe. Alongside discovering the city's history and culture, participants completed a field exercise connected to project planning, working in international teams to observe local realities and identify possible community needs.",
            'From day four, the ideas began to turn into real projects. Participants worked in pairs, each pair combining one experienced youth worker with a newcomer, so that peer learning and confidence-building were part of the writing process itself. Using research, local data and their daily experience with young people, the pairs chose their project topics and laid the foundations of future Erasmus+ initiatives. The group also studied the structure and logic of the KA152 (Youth Exchanges) and KA154 (Youth Participation Activities) application forms and built shared approaches to answering their questions.',
            'On day five, the teams developed their concepts into detailed project plans. The focus was on designing engaging activities based on non-formal education and describing those methods properly in an application form. Participants learned to build project schedules and timelines, including the official timetable templates for Youth Exchanges and month-by-month planning for Participation Projects. They also worked with the SALTO-YOUTH platform and the Erasmus+ Quality Standards, analysing how quality, inclusion, participation and learning outcomes should run through every part of a project.',
            "Day six combined further work on the project ideas with an in-depth session on Youthpass. Participants explored how to make reflection sessions more engaging and meaningful, how to support young people in keeping learning journals, how to help them recognise the competences they develop, and how to make the most of their Youthpass certificates. In the afternoon, all the knowledge, methods and practical tips gathered during the week were brought together into one shared result: the Youth Workers' Writing Guide.",
        ],
        'impacts': [
            'Newcomers to Erasmus+ gained a practical, step-by-step understanding of how projects are designed, written and implemented, supported directly by experienced peers.',
            'Experienced youth workers strengthened their mentoring role and refined their own methods through peer exchange.',
            'Participants learned to base projects on real, researched needs of young people in their communities rather than on assumptions.',
            'New partnerships were formed between organisations from seven countries, including Moldova as a partner country.',
            'Participants improved their use of quality tools such as the Erasmus+ Quality Standards, SALTO-YOUTH and Youthpass.',
        ],
        'results': [
            'Draft Erasmus+ project concepts developed by mixed pairs of experienced and new youth workers, which participants will continue developing with their partner organisations and young people for upcoming Erasmus+ deadlines.',
            "The Youth Workers' Writing Guide, a resource for newcomers covering the basics of Erasmus+ project development, writing, planning and implementation, announced for publication on the IYAC Bulgaria website.",
            'Shared structures and approaches for KA152 and KA154 application forms.',
        ],
        'after': {1: ('photo', 'photo-1'), 4: ('duo', 'photo-2', 'photo-5')},
    },
    'beyondthegame': {
        'title': 'Beyond the Game',
        'tagline': 'Football as a tool for teamwork, inclusion, intercultural learning and understanding society',
        'facts': [('Dates', '13–21 June 2026'), ('Location', 'Youtopia Riverside guest house, Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Poland, Romania and Greece'), ('Format', 'Erasmus+ Youth Exchange')],
        'flags': ['bg', 'pl', 'ro', 'gr'],
        'meta': 'Youth Exchange · Jun 2026',
        'paragraphs': [
            '"Beyond the Game" was an Erasmus+ youth exchange that used football as a starting point for learning about teamwork, inclusion, history and culture. Young people from Bulgaria, Poland, Romania and Greece met in Stara Zagora to explore the values and stories behind the world\'s most popular sport, using non-formal education methods throughout.',
            "The exchange opened on 14 June with team-building activities and an introduction to the project's goals. After the first icebreakers, international teams designed and led their own games, setting the tone for a week in which participants would be active creators rather than an audience.",
            'On the second day, a football knowledge quiz helped participants identify their starting points and divided the group into three levels: Beginners, Explorers and Experts. This structure shaped the rest of the exchange, with participants learning from each other across levels. The day ended with a presentation on sport by the Greek team and a Greek cultural evening with traditional food.',
            "Day three was built on learning by doing and peer-to-peer exchange. Working in their three groups, participants examined five of football's most debated rules: offside, VAR, the back-pass rule, handball offences and the advantage rule. The Experts first shared their knowledge, then the Beginners took on the role of facilitators and explained the rules to everyone else. The group also looked at the history of these rules and how they have changed over time. Following the Greek perspective from the day before, participants from Romania, Poland and Bulgaria presented the historical and social role of football in their own countries, which led to debates on how the game reflects culture, values and society.",
            "On day four the group travelled to Veliko Tarnovo, one of Bulgaria's most historic cities. Through experiential learning, participants explored how history, identity and tradition shape societies and influence the way people connect through sport. The visit underlined one of the project's central ideas: to understand football, you also need to understand the people, cultures and stories behind it.",
            "In the final days, participants tested, improved and finalised the workshops and activities they had created themselves. These games used football and non-formal education to build teamwork, coordination, trust, communication and inclusion. A Polish cultural evening introduced the group to Polish music, dances and food, including a session where everyone learned to make pierogi together. The exchange closed on 20 June with farewell games, a reflection and evaluation session in which participants shared their learning and personal growth, and a Youthpass ceremony recognising everyone's achievements.",
        ],
        'impacts': [
            'Participants developed teamwork, communication, facilitation and leadership skills, especially through the Beginners-as-facilitators approach.',
            'Young people with different levels of football knowledge learned together on equal terms, putting inclusion into practice.',
            'The group gained a deeper understanding of how sport connects to history, identity and society across four countries.',
            'Intercultural understanding grew through cultural evenings, debates and the shared visit to Veliko Tarnovo.',
            "Participants' learning was formally recognised through Youthpass.",
        ],
        'results': [
            'A set of participant-designed workshops and games that use football and non-formal education to build teamwork, trust, communication and inclusion, tested and refined during the exchange.',
            'Peer-led sessions explaining five controversial football rules and their history.',
            'Youthpass certificates for all participants.',
        ],
        'after': {1: ('photo', 'photo-1'), 3: ('duo', 'photo-2', 'photo-5')},
    },
    'breakthesilence': {
        'title': 'Break the Silence',
        'tagline': 'Forum Theatre and Theatre of the Oppressed as tools for dialogue, inclusion and social change',
        'facts': [('Dates', '23 to 29 June 2026'), ('Location', 'Youtopia Riverside guest house, Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Romania, Poland and Turkey'), ('Format', 'Erasmus+ Youth Exchange')],
        'flags': ['bg', 'ro', 'pl', 'tr'],
        'meta': 'Youth Exchange · Jun 2026',
        'paragraphs': [
            '"Break the Silence" was an Erasmus+ youth exchange that brought together young people from Romania, Poland, Bulgaria and Turkey to explore theatre as a tool for dialogue and social change. Using the methods of the Theatre of the Oppressed, especially Forum Theatre, participants worked on giving a voice to experiences that often go unheard.',
            'The first day, 23 June, focused on getting to know one another through team-building activities and theatre-based games that helped participants step outside their comfort zones and build the trust needed to work on sensitive social topics. The evening was hosted by the Romanian team, who taught traditional dances and served a homemade barbecue with mici, mujdei and other Romanian specialities.',
            'On day two, participants went deeper into theatre as a method. Through improvisation and experimental exercises, they learned the principles of the Theatre of the Oppressed and how Forum Theatre and Newspaper Theatre work. In the afternoon, the creative process began: participants shared personal moments when they had felt oppressed or faced difficult situations, and discovered how many of these experiences were shared across cultures. The group chose four stories that resonated with everyone and began turning them into scenes using Image Theatre. The Turkish cultural evening that followed included traditional music, dances and sweets, and an interactive performance of a traditional Turkish wedding.',
            'Day three took the group to Burgas on the Black Sea coast. The trip became an extension of the theatre work: participants observed people, places and everyday interactions as living scenes that reflect society, and learned about Bulgarian culture and daily life through conversations and exploration.',
            'Day four was dedicated to the Forum Theatre performances. Participants refined their scenes, rehearsed and developed detailed background stories for each character. In the evening, they welcomed young people from Stara Zagora to a local Forum Theatre event at Youtopia. After an introduction to the Theatre of the Oppressed, the local audience did not just watch: they stepped into the scenes, proposed alternatives, tested solutions and changed the outcome of the conflicts together with the actors. The performances dealt with censorship and freedom, strict and abusive parenting, democracy and personal autonomy. The day closed with a Bulgarian cultural evening featuring kebapche, lyutenitsa, banitsa and homemade tarator.',
            'Day five introduced Newspaper Theatre. Using real headlines from the previous days, groups turned news articles into short scenes in which one participant played a TV presenter and the others played viewers reacting at home. Through improvisation and open discussion, participants saw how the same headline can be interpreted in many ways depending on experience and values, and practised questioning what they read instead of accepting it at face value.',
            'On day six, participants explored further improvisation techniques focused on trust, listening and communicating beyond words. They also worked on one of the project\'s key outcomes: a guidebook collecting the methods, activities and lessons of the exchange, designed to help other young people, youth workers and educators use theatre for dialogue, inclusion and social change. The evening belonged to the Polish team and their traditional food, music, dances and customs.',
            'The exchange ended on 29 June with creative theatre reflections on the week, games and farewells. Participants left having grown as performers, as friends and as active young people ready to make a difference in their communities.',
        ],
        'impacts': [
            'Participants learned to use Forum Theatre, Image Theatre and Newspaper Theatre as practical tools for addressing oppression, conflict and social issues.',
            'Young people gained confidence in expressing themselves, sharing personal experiences and speaking about difficult topics in a safe group.',
            'Media literacy and critical thinking improved through work with real news headlines.',
            'The project reached beyond the group: local young people in Stara Zagora took an active part in the Forum Theatre event and engaged with themes such as censorship, democracy and personal autonomy.',
            'Intercultural understanding between Bulgarian, Romanian, Polish and Turkish youth was strengthened through four national cultural evenings and shared creative work.',
        ],
        'results': [
            "Four Forum Theatre scenes based on participants' real experiences, performed for and with local young people at a public event in Stara Zagora on 26 June 2026.",
            'A guidebook of the theatre methods, activities and lessons from the exchange, for use by young people, youth workers and educators.',
        ],
        'after': {1: ('photo', 'photo-1'), 4: ('duo', 'photo-2', 'photo-5')},
    },
    'atasteofeurope': {
        'title': 'A Taste of Europe',
        'tagline': 'Cooking workshops as a non-formal education method for intercultural learning in youth work',
        'facts': [('Dates', '10–18 August 2026'), ('Location', 'Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Romania, Poland, Slovakia and Greece'),
                  ('Format', 'Erasmus+ Training Course for youth workers')],
        'flags': ['bg', 'ro', 'pl', 'sk', 'gr'],
        'meta': 'Training Course · Aug 2026',
        'paragraphs': [
            '"A Taste of Europe" was an Erasmus+ training course that brought youth workers from Bulgaria, Romania, Poland, Slovakia and Greece to Stara Zagora to explore cooking as a tool for intercultural learning. The idea behind the project was that food opens a window onto a country\'s history, values and everyday life, and that cooking together can be a practical, inclusive way for youth workers to run intercultural activities with young people.',
            "The course began on 11 August with team-building games, an introduction to the project's objectives, and the first planning of the menus for the cooking days ahead.",
            "On day two, national teams finalised their menus, workshop methodologies, ingredient and shopping lists using a shared template. This template became the basis of the project's main result, a Guide on Cooking for Youth Workers. After a group shopping trip, the Greek team opened the series of cooking workshops with a presentation on Greek cuisine, culture and history. Participants then split into four teams at different cooking stations, rotating so that each team prepared a dish at every station. The day ended with a dinner prepared together under the Greek team's guidance and a Greek cultural evening with traditional dances and songs.",
            'Day three took the group out of the kitchen and into Stara Zagora. Participants visited local museums, walked through the city centre, saw the Roman forum and historical monuments, and spoke with local people to learn more about Bulgarian culture, history and daily life.',
            'On day four, participants continued work on the cooking guidebooks, finalising the methodologies that will help facilitators run similar workshops in the future. In the afternoon the Slovak team led the workshop. In international teams across several stations, the group prepared chicken breast baked with apricot, cheese and rice, cucumber salad, fried cheese with fries and tartar sauce as a vegetarian option, and smotanová torta, a sour cream cake. The evening continued with Slovak dances, songs and games.',
            "Day five began with a review of what participants had learned in the Slovak workshop, putting the methodology into practice. Then the Polish team presented Polish culture and history and showed how centuries of tradition have shaped the country's cuisine. The afternoon workshop covered borscht, handmade pierogi and cakes, all prepared together at the international stations.",
            'On day six, after reviewing the Polish workshop, participants completed the cooking guidebooks they had been building since the first day. The Romanian team then led the workshop on Romanian cuisine and culture, preparing ardei umpluți (stuffed peppers), strawberry mousse, pies with cheese and cherries, "Dracula potatoes" and eggplant salads.',
        ],
        'impacts': [
            'Youth workers gained a tested, practical method for running intercultural cooking workshops with young people, including how to plan menus, structure station-based teamwork and link food to history and culture.',
            'Participants practised facilitation by leading workshops for an international group in their own national teams.',
            'Intercultural knowledge grew across five countries through presentations on national cuisine, history and traditions, and through cultural evenings.',
            'Station-based rotation built teamwork and cooperation in mixed international groups.',
        ],
        'results': [
            'The Guide on Cooking for Youth Workers (cooking guidebooks with workshop methodologies, menus, ingredient lists and shopping lists), completed on Day 6 and announced for publication on the IYAC Bulgaria website.',
            "Cooking workshops on Greek, Slovak, Polish and Romanian cuisine, each paired with a presentation on that country's culture and history.",
        ],
        # Dish cards (the dishes are quoted from the text above)
        'menu': [('sk', 'smotanová torta, a sour cream cake'), ('pl', 'borscht, handmade pierogi and cakes'),
                 ('ro', 'ardei umpluți (stuffed peppers)')],
        'after': {1: ('photo', 'photo-1'), 4: ('duo', 'photo-2', 'photo-5'), 5: ('menu',)},
    },
}
