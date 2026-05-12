const prompts = [
  {
    id: "intro-self",
    level: "zero",
    levelLabel: "왕초보",
    category: "intro",
    categoryLabel: "자기소개",
    question: "Tell me about yourself. What kind of person are you?",
    korean: "자기소개를 해주세요. 당신은 어떤 사람인가요?",
    goal: "이름, 하는 일, 성격, 좋아하는 것 하나를 쉬운 문장으로 말합니다.",
    simple:
      "Hi, my name is Minji. I work in an office. I am a quiet but positive person. In my free time, I like watching movies at home. It helps me relax.",
    simpleKo:
      "안녕하세요, 제 이름은 민지입니다. 저는 사무실에서 일합니다. 저는 조용하지만 긍정적인 사람입니다. 쉬는 시간에는 집에서 영화 보는 것을 좋아합니다. 그것은 제가 쉬는 데 도움이 됩니다.",
    im:
      "Hi, my name is Minji, and I currently work at a small company in Seoul. I would say I am a calm and responsible person. At first, I may look a little quiet, but once I get close to people, I enjoy talking and joking with them. After work, I usually watch movies or take a short walk near my apartment. These days, I am trying to improve my English because I want to feel more confident when I travel or meet new people.",
    imKo:
      "안녕하세요, 제 이름은 민지이고 현재 서울의 작은 회사에서 일하고 있습니다. 저는 차분하고 책임감 있는 사람이라고 생각합니다. 처음에는 조금 조용해 보일 수 있지만, 사람들과 친해지면 대화하고 농담하는 것을 좋아합니다. 퇴근 후에는 보통 영화를 보거나 아파트 근처를 산책합니다. 요즘은 여행하거나 새로운 사람을 만날 때 더 자신감을 갖고 싶어서 영어 실력을 키우려고 노력하고 있습니다.",
    chunks: [
      ["시작", "Hi, my name is ___. I currently work/study ___."],
      ["성격", "I would say I am a ___ and ___ person."],
      ["취미", "In my free time, I usually ___ because it helps me relax."],
      ["마무리", "These days, I am trying to ___."],
    ],
  },
  {
    id: "home-place",
    level: "zero",
    levelLabel: "왕초보",
    category: "home",
    categoryLabel: "집/동네",
    question: "Describe your home. What is your favorite place there?",
    korean: "당신의 집을 묘사해주세요. 집에서 가장 좋아하는 장소는 어디인가요?",
    goal: "집 전체를 어렵게 묘사하지 말고, 좋아하는 공간 하나와 이유를 말합니다.",
    simple:
      "My home is not very big, but it is comfortable. My favorite place is my room. I have a desk, a bed, and a small lamp. I like my room because it is quiet. I can rest and watch videos there.",
    simpleKo:
      "제 집은 아주 크지는 않지만 편안합니다. 제가 가장 좋아하는 장소는 제 방입니다. 책상, 침대, 작은 램프가 있습니다. 조용해서 제 방을 좋아합니다. 그곳에서 쉬고 영상을 볼 수 있습니다.",
    im:
      "My home is a small apartment, but it is very comfortable for me. My favorite place is definitely my room. It is not fancy, but it has everything I need, like my bed, desk, laptop, and a warm lamp. After a long day, I usually sit at my desk and watch videos or listen to music. The best thing about my room is that it feels private and peaceful. So whenever I feel tired or stressed, I spend time there and recharge.",
    imKo:
      "제 집은 작은 아파트이지만 저에게는 매우 편안한 공간입니다. 제가 가장 좋아하는 장소는 단연 제 방입니다. 화려하지는 않지만 침대, 책상, 노트북, 따뜻한 조명처럼 필요한 것이 다 있습니다. 긴 하루가 끝난 뒤에는 보통 책상에 앉아 영상을 보거나 음악을 듣습니다. 제 방의 가장 좋은 점은 개인적이고 평화롭게 느껴진다는 것입니다. 그래서 피곤하거나 스트레스를 받을 때 그곳에서 시간을 보내며 충전합니다.",
    chunks: [
      ["전체 소개", "My home is ___, but it is ___."],
      ["장소", "My favorite place is ___."],
      ["디테일", "It has ___, ___, and ___."],
      ["이유", "I like it because it feels ___."],
    ],
  },
  {
    id: "neighborhood",
    level: "novice",
    levelLabel: "초보",
    category: "home",
    categoryLabel: "집/동네",
    question: "Tell me about your neighborhood. What do you usually do there?",
    korean: "당신의 동네에 대해 말해주세요. 그곳에서 보통 무엇을 하나요?",
    goal: "동네 분위기, 자주 가는 장소, 평소 행동을 연결합니다.",
    simple:
      "My neighborhood is quiet and safe. There are many cafes and small restaurants. I usually go to a cafe on weekends. I drink coffee, listen to music, and sometimes study English there.",
    simpleKo:
      "제 동네는 조용하고 안전합니다. 카페와 작은 식당이 많습니다. 저는 주말에 보통 카페에 갑니다. 커피를 마시고 음악을 듣고 가끔 그곳에서 영어 공부를 합니다.",
    im:
      "My neighborhood is pretty quiet, but it has many useful places. There are several cafes, convenience stores, and a small park near my apartment. On weekdays, I do not spend much time outside because I am usually tired after work. But on weekends, I often go to my favorite cafe. I order an iced americano, listen to music, and review English expressions. I like my neighborhood because it is not too crowded, and everything I need is close to my home.",
    imKo:
      "제 동네는 꽤 조용하지만 유용한 장소가 많습니다. 아파트 근처에는 카페, 편의점, 작은 공원이 여러 곳 있습니다. 평일에는 퇴근 후 보통 피곤해서 밖에서 많은 시간을 보내지 않습니다. 하지만 주말에는 자주 좋아하는 카페에 갑니다. 아이스 아메리카노를 주문하고 음악을 들으며 영어 표현을 복습합니다. 제 동네는 너무 붐비지 않고 필요한 것이 집 근처에 있어서 좋습니다.",
    chunks: [
      ["분위기", "My neighborhood is pretty ___."],
      ["시설", "There are ___, ___, and ___ near my home."],
      ["평소 행동", "I usually ___ on weekends."],
      ["감정", "I like it because ___."],
    ],
  },
  {
    id: "daily-routine",
    level: "zero",
    levelLabel: "왕초보",
    category: "routine",
    categoryLabel: "일상",
    question: "What do you usually do on weekdays?",
    korean: "평일에는 보통 무엇을 하나요?",
    goal: "아침, 낮, 저녁 순서로 현재형 문장을 이어갑니다.",
    simple:
      "On weekdays, I wake up around seven. I go to work in the morning. After work, I come back home and have dinner. At night, I watch videos or study English for a short time.",
    simpleKo:
      "평일에는 7시쯤 일어납니다. 아침에 출근합니다. 퇴근 후 집에 돌아와 저녁을 먹습니다. 밤에는 영상을 보거나 잠깐 영어 공부를 합니다.",
    im:
      "My weekdays are simple but quite busy. I usually wake up around seven and get ready for work. In the morning, I check messages and make a quick plan for the day. After work, I come back home, have dinner, and take a short rest. These days, I try to study English for at least twenty minutes before going to bed. It is not always easy, but I feel proud when I keep the routine.",
    imKo:
      "제 평일은 단순하지만 꽤 바쁩니다. 보통 7시쯤 일어나 출근 준비를 합니다. 아침에는 메시지를 확인하고 하루 계획을 간단히 세웁니다. 퇴근 후에는 집에 돌아와 저녁을 먹고 잠깐 쉽니다. 요즘은 잠들기 전에 최소 20분이라도 영어 공부를 하려고 합니다. 항상 쉽지는 않지만 루틴을 지키면 뿌듯합니다.",
    chunks: [
      ["아침", "I usually wake up around ___."],
      ["낮", "During the day, I ___."],
      ["저녁", "After work/school, I ___."],
      ["요즘", "These days, I try to ___."],
    ],
  },
  {
    id: "free-time",
    level: "zero",
    levelLabel: "왕초보",
    category: "hobby",
    categoryLabel: "취미",
    question: "What do you like to do in your free time?",
    korean: "여가 시간에 무엇을 하는 것을 좋아하나요?",
    goal: "좋아하는 활동 하나, 이유 하나, 최근 예시 하나를 말합니다.",
    simple:
      "In my free time, I like watching movies. I usually watch them at home. I like comedy movies because they are fun and easy to watch. Last weekend, I watched a movie and it made me feel better.",
    simpleKo:
      "여가 시간에는 영화 보는 것을 좋아합니다. 보통 집에서 봅니다. 코미디 영화는 재미있고 보기 편해서 좋아합니다. 지난 주말에도 영화를 봤고 기분이 좋아졌습니다.",
    im:
      "In my free time, I usually watch movies or short videos at home. I especially like comedy movies because they help me forget about stress. I do not need to think too much, and I can just relax on my bed. For example, last weekend, I watched a funny movie after a busy week. It was not a famous movie, but I laughed a lot, and it really helped me refresh my mood. That is why watching movies is my favorite way to rest.",
    imKo:
      "여가 시간에는 보통 집에서 영화나 짧은 영상을 봅니다. 특히 코미디 영화를 좋아하는데 스트레스를 잊게 해주기 때문입니다. 너무 많이 생각할 필요 없이 침대에서 편하게 쉴 수 있습니다. 예를 들어 지난 주말에는 바쁜 한 주를 보낸 뒤 재미있는 영화를 봤습니다. 유명한 영화는 아니었지만 많이 웃었고 기분 전환에 정말 도움이 되었습니다. 그래서 영화 보기는 제가 가장 좋아하는 휴식 방법입니다.",
    chunks: [
      ["활동", "In my free time, I like ___."],
      ["이유", "I like it because ___."],
      ["예시", "For example, last weekend, I ___."],
      ["마무리", "It really helped me ___."],
    ],
  },
  {
    id: "music",
    level: "novice",
    levelLabel: "초보",
    category: "hobby",
    categoryLabel: "취미",
    question: "What kind of music do you like? When do you listen to it?",
    korean: "어떤 음악을 좋아하나요? 언제 그 음악을 듣나요?",
    goal: "음악 종류, 듣는 상황, 기분 변화를 말합니다.",
    simple:
      "I like pop music. I listen to it when I walk or take the subway. It gives me energy. Sometimes I listen to calm music at night because it helps me sleep.",
    simpleKo:
      "저는 팝 음악을 좋아합니다. 걷거나 지하철을 탈 때 듣습니다. 그것은 저에게 에너지를 줍니다. 밤에는 잠자는 데 도움이 되어서 가끔 잔잔한 음악을 듣습니다.",
    im:
      "I usually listen to pop music, but it depends on my mood. When I go to work, I listen to bright and energetic songs because they help me wake up. On the other hand, at night, I prefer calm music. It makes my room feel more peaceful, and it helps me slow down after a busy day. I do not know a lot about music, but I think it is a simple way to change my mood.",
    imKo:
      "저는 보통 팝 음악을 듣지만 기분에 따라 달라집니다. 출근할 때는 밝고 에너지 있는 노래를 듣는데 잠을 깨는 데 도움이 되기 때문입니다. 반면 밤에는 차분한 음악을 더 좋아합니다. 방을 더 평화롭게 느끼게 해주고 바쁜 하루 뒤 속도를 늦추는 데 도움이 됩니다. 음악에 대해 많이 알지는 못하지만 기분을 바꾸는 간단한 방법이라고 생각합니다.",
    chunks: [
      ["종류", "I usually listen to ___ music."],
      ["상황", "When I ___, I listen to ___ songs."],
      ["대조", "On the other hand, at night, I prefer ___."],
      ["생각", "I think music is a simple way to ___."],
    ],
  },
  {
    id: "memorable-trip",
    level: "novice",
    levelLabel: "초보",
    category: "experience",
    categoryLabel: "경험",
    question: "Tell me about a memorable trip or outing you had recently.",
    korean: "최근 기억에 남는 여행이나 외출 경험을 말해주세요.",
    goal: "언제, 누구와, 어디서, 무슨 일이 있었는지 과거형으로 말합니다.",
    simple:
      "Last month, I went to Busan with my friend. We ate seafood and walked near the beach. The weather was sunny, so the ocean looked beautiful. I felt relaxed and happy.",
    simpleKo:
      "지난달 친구와 부산에 갔습니다. 우리는 해산물을 먹고 해변 근처를 걸었습니다. 날씨가 맑아서 바다가 아름다워 보였습니다. 저는 편안하고 행복했습니다.",
    im:
      "One memorable outing I had recently was a short trip to Busan with my friend. We only stayed there for one day, but it was still special. First, we had seafood near the beach, and then we walked along the ocean for about an hour. The weather was perfect, so many people were taking pictures. What I remember most is the sound of the waves and the fresh air. I had been stressed before the trip, but after that day, I felt much lighter.",
    imKo:
      "최근 기억에 남는 외출은 친구와 함께 부산에 다녀온 짧은 여행입니다. 하루만 머물렀지만 그래도 특별했습니다. 먼저 해변 근처에서 해산물을 먹고 약 한 시간 동안 바다를 따라 걸었습니다. 날씨가 완벽해서 많은 사람들이 사진을 찍고 있었습니다. 가장 기억에 남는 것은 파도 소리와 상쾌한 공기였습니다. 여행 전에는 스트레스를 받았지만 그날 이후 훨씬 가벼운 기분이 들었습니다.",
    chunks: [
      ["언제/누구", "Last ___, I went to ___ with ___."],
      ["활동", "First, we ___. Then, we ___."],
      ["장면", "What I remember most is ___."],
      ["감정", "After that day, I felt ___."],
    ],
  },
  {
    id: "problem-service",
    level: "im",
    levelLabel: "IM 목표",
    category: "experience",
    categoryLabel: "경험",
    question: "Describe a problem you had while using a service and how you solved it.",
    korean: "서비스를 이용하다가 생긴 문제와 그것을 어떻게 해결했는지 설명해주세요.",
    goal: "문제, 감정, 행동, 결과를 순서대로 말합니다.",
    simple:
      "I had a problem with a delivery app. My food arrived late, and I was hungry. I called the restaurant and asked about my order. They said sorry and sent the food again. Finally, I got my food.",
    simpleKo:
      "배달 앱에서 문제가 있었습니다. 음식이 늦게 도착했고 저는 배가 고팠습니다. 식당에 전화해서 주문에 대해 물어봤습니다. 그들은 사과하고 음식을 다시 보냈습니다. 결국 음식을 받았습니다.",
    im:
      "I once had a problem while using a delivery app. I ordered dinner after work, but the app said the food was delivered even though I had not received anything. At first, I felt annoyed because I was very hungry and tired. So I checked the address again and contacted customer service through the app. I explained the situation clearly and sent a screenshot of the order. After about ten minutes, they called the driver and found out that the food had been delivered to the wrong building. In the end, I got a refund and ordered something else. It was inconvenient, but I learned that it is important to explain the problem calmly.",
    imKo:
      "한 번은 배달 앱을 사용하다가 문제가 있었습니다. 퇴근 후 저녁을 주문했는데 음식을 받지 못했는데도 앱에는 배달 완료라고 표시되었습니다. 처음에는 매우 배고프고 피곤해서 짜증이 났습니다. 그래서 주소를 다시 확인하고 앱을 통해 고객센터에 연락했습니다. 상황을 명확하게 설명하고 주문 화면 캡처를 보냈습니다. 약 10분 후 고객센터가 기사에게 연락했고 음식이 다른 건물로 배달된 것을 알게 되었습니다. 결국 환불을 받고 다른 음식을 주문했습니다. 불편했지만 문제를 차분하게 설명하는 것이 중요하다는 것을 배웠습니다.",
    chunks: [
      ["문제", "I once had a problem while using ___."],
      ["감정", "At first, I felt ___ because ___."],
      ["행동", "So I checked ___ and contacted ___."],
      ["결과", "In the end, ___."],
      ["교훈", "I learned that ___."],
    ],
  },
  {
    id: "past-now-hobby",
    level: "im",
    levelLabel: "IM 목표",
    category: "comparison",
    categoryLabel: "비교",
    question: "Compare how you enjoyed your hobby in the past and how you enjoy it now.",
    korean: "과거와 현재에 취미를 즐기는 방식이 어떻게 다른지 비교해주세요.",
    goal: "과거에는 어떻게 했는지, 지금은 어떻게 하는지, 이유를 비교합니다.",
    simple:
      "In the past, I watched movies at the theater. I went there with my friends. But now, I usually watch movies at home. It is cheaper and more comfortable. I can pause the movie whenever I want.",
    simpleKo:
      "과거에는 영화관에서 영화를 봤습니다. 친구들과 그곳에 갔습니다. 하지만 지금은 보통 집에서 영화를 봅니다. 더 저렴하고 편합니다. 원할 때 언제든 영화를 멈출 수 있습니다.",
    im:
      "In the past, I usually enjoyed movies at the theater. When I was a student, going to the theater felt like a special event, so I often went there with my friends on weekends. These days, however, I mostly watch movies at home using streaming services. The biggest reason is convenience. I can choose a movie quickly, wear comfortable clothes, and pause it whenever I need to. I still like the theater experience, especially for action movies, but for everyday relaxation, watching movies at home fits my lifestyle much better.",
    imKo:
      "과거에는 보통 영화관에서 영화를 즐겼습니다. 학생이었을 때 영화관에 가는 것은 특별한 이벤트처럼 느껴져서 주말에 친구들과 자주 갔습니다. 하지만 요즘은 주로 스트리밍 서비스를 이용해 집에서 영화를 봅니다. 가장 큰 이유는 편리함입니다. 영화를 빠르게 고르고 편한 옷을 입고 필요할 때 언제든 멈출 수 있습니다. 액션 영화처럼 영화관 경험이 좋은 경우도 여전히 좋아하지만, 일상적인 휴식에는 집에서 보는 것이 제 생활 방식에 훨씬 잘 맞습니다.",
    chunks: [
      ["과거", "In the past, I used to ___."],
      ["현재", "These days, I mostly ___."],
      ["이유", "The biggest reason is ___."],
      ["균형", "I still like ___, but ___ fits my lifestyle better."],
    ],
  },
  {
    id: "roleplay-hotel",
    level: "novice",
    levelLabel: "초보",
    category: "roleplay",
    categoryLabel: "롤플레이",
    question: "Call a hotel and ask three or four questions before making a reservation.",
    korean: "호텔에 전화해서 예약하기 전에 질문 세네 가지를 해보세요.",
    goal: "정중하게 시작하고 가격, 위치, 체크인, 조식 질문을 던집니다.",
    simple:
      "Hello, I would like to ask about your hotel. Do you have a room for this Saturday? How much is it for one night? What time can I check in? Also, is breakfast included?",
    simpleKo:
      "안녕하세요, 호텔에 대해 문의하고 싶습니다. 이번 토요일에 방이 있나요? 1박에 얼마인가요? 몇 시에 체크인할 수 있나요? 그리고 조식이 포함되어 있나요?",
    im:
      "Hello, I am planning to stay in your area this Saturday, and I have a few questions before I make a reservation. First, do you have any rooms available for two people? Second, how much is one night, including taxes? Also, I would like to know what time check-in starts. Finally, is breakfast included in the price, or do I need to pay extra for it? Thank you. That information will help me decide.",
    imKo:
      "안녕하세요, 이번 토요일에 그 지역에 머물 계획이라 예약하기 전에 몇 가지 질문이 있습니다. 먼저 2명이 묵을 수 있는 방이 있나요? 두 번째로 세금 포함 1박 가격이 얼마인가요? 또한 체크인이 몇 시부터 시작되는지 알고 싶습니다. 마지막으로 조식이 가격에 포함되어 있나요, 아니면 추가 비용을 내야 하나요? 감사합니다. 그 정보가 결정하는 데 도움이 될 것 같습니다.",
    chunks: [
      ["시작", "Hello, I have a few questions before I make a reservation."],
      ["가능 여부", "Do you have any rooms available for ___?"],
      ["가격", "How much is it for one night?"],
      ["추가 질문", "Is ___ included in the price?"],
    ],
  },
  {
    id: "roleplay-appointment",
    level: "im",
    levelLabel: "IM 목표",
    category: "roleplay",
    categoryLabel: "롤플레이",
    question: "You cannot attend an appointment. Call your friend and suggest another plan.",
    korean: "약속에 갈 수 없습니다. 친구에게 전화해서 다른 계획을 제안하세요.",
    goal: "사과, 이유, 대안, 확인 질문을 자연스럽게 말합니다.",
    simple:
      "Hi, I am sorry, but I cannot meet you today. Something came up at work. Can we meet tomorrow instead? I am free after six. Please let me know if that works for you.",
    simpleKo:
      "안녕, 미안하지만 오늘 만날 수 없어. 회사에서 일이 생겼어. 대신 내일 만날 수 있을까? 나는 6시 이후에 시간이 있어. 괜찮은지 알려줘.",
    im:
      "Hi, I am really sorry, but I do not think I can make it to our appointment today. Something urgent came up at work, and I may have to stay late. I know we planned this a few days ago, so I feel bad about changing it at the last minute. Would it be okay if we met tomorrow evening instead? I am free after six, and I can come to the same place. If tomorrow does not work for you, I can also do Saturday afternoon.",
    imKo:
      "안녕, 정말 미안한데 오늘 약속에 못 갈 것 같아. 회사에서 급한 일이 생겨서 늦게까지 있어야 할 수도 있어. 며칠 전부터 계획했던 거라 마지막 순간에 바꾸게 되어 미안해. 대신 내일 저녁에 만나는 건 괜찮을까? 나는 6시 이후에 시간이 되고 같은 장소로 갈 수 있어. 내일이 안 되면 토요일 오후도 가능해.",
    chunks: [
      ["사과", "I am really sorry, but I cannot make it today."],
      ["이유", "Something urgent came up ___."],
      ["대안", "Would it be okay if we met ___ instead?"],
      ["선택지", "If that does not work, I can also ___."],
    ],
  },
  {
    id: "restaurant",
    level: "novice",
    levelLabel: "초보",
    category: "experience",
    categoryLabel: "경험",
    question: "Tell me about a restaurant you like.",
    korean: "좋아하는 식당에 대해 말해주세요.",
    goal: "위치, 음식, 분위기, 다시 가는 이유를 말합니다.",
    simple:
      "I like a small pasta restaurant near my home. The food is delicious, and the price is not too expensive. I usually order cream pasta. The place is quiet, so I can enjoy dinner with my friend.",
    simpleKo:
      "저는 집 근처의 작은 파스타 식당을 좋아합니다. 음식이 맛있고 가격이 너무 비싸지 않습니다. 보통 크림 파스타를 주문합니다. 그곳은 조용해서 친구와 저녁을 즐길 수 있습니다.",
    im:
      "One restaurant I really like is a small pasta place near my home. It is not a famous restaurant, but it has a cozy atmosphere. I usually order cream pasta and garlic bread there. The pasta is rich, and the portion is just right for me. Another reason I like the restaurant is that the staff members are friendly. They do not rush customers, so I can sit there and talk with my friend for a long time. Whenever I want a comfortable dinner, I think of that place first.",
    imKo:
      "제가 정말 좋아하는 식당은 집 근처의 작은 파스타집입니다. 유명한 식당은 아니지만 아늑한 분위기가 있습니다. 저는 보통 그곳에서 크림 파스타와 마늘빵을 주문합니다. 파스타는 진하고 양도 저에게 딱 맞습니다. 그 식당을 좋아하는 또 다른 이유는 직원들이 친절하다는 점입니다. 손님을 재촉하지 않아서 친구와 오래 앉아 이야기할 수 있습니다. 편안한 저녁을 먹고 싶을 때마다 그곳이 먼저 떠오릅니다.",
    chunks: [
      ["소개", "One restaurant I really like is ___."],
      ["음식", "I usually order ___ there."],
      ["분위기", "It has a ___ atmosphere."],
      ["이유", "Another reason I like it is ___."],
    ],
  },
  {
    id: "shopping",
    level: "novice",
    levelLabel: "초보",
    category: "routine",
    categoryLabel: "일상",
    question: "How do you usually shop for clothes or daily items?",
    korean: "옷이나 생활용품을 보통 어떻게 쇼핑하나요?",
    goal: "온라인/오프라인 방식, 장점, 최근 구매 경험을 말합니다.",
    simple:
      "I usually shop online. It is easy and fast. I can compare prices and read reviews. Recently, I bought a black T-shirt online. It was simple, but I liked it.",
    simpleKo:
      "저는 보통 온라인으로 쇼핑합니다. 쉽고 빠릅니다. 가격을 비교하고 리뷰를 읽을 수 있습니다. 최근에는 온라인으로 검은색 티셔츠를 샀습니다. 단순했지만 마음에 들었습니다.",
    im:
      "I usually shop online, especially for daily items and simple clothes. Online shopping is convenient because I can compare prices, check reviews, and order things late at night. For clothes, I still prefer simple items like T-shirts or socks because the size is easier to choose. Recently, I bought a black T-shirt from an online store. It arrived quickly, and the quality was better than I expected. However, if I need formal clothes, I prefer going to an actual store because I want to try them on first.",
    imKo:
      "저는 보통 생활용품과 간단한 옷은 온라인으로 쇼핑합니다. 온라인 쇼핑은 가격을 비교하고 리뷰를 확인하고 밤늦게도 주문할 수 있어서 편리합니다. 옷의 경우 사이즈 선택이 쉬운 티셔츠나 양말 같은 단순한 제품을 선호합니다. 최근에는 온라인 쇼핑몰에서 검은색 티셔츠를 샀습니다. 빨리 도착했고 품질도 기대보다 좋았습니다. 하지만 정장처럼 격식 있는 옷이 필요하면 먼저 입어보고 싶어서 실제 매장에 가는 것을 선호합니다.",
    chunks: [
      ["방식", "I usually shop ___."],
      ["장점", "It is convenient because I can ___."],
      ["최근", "Recently, I bought ___."],
      ["예외", "However, if I need ___, I prefer ___."],
    ],
  },
  {
    id: "weather",
    level: "zero",
    levelLabel: "왕초보",
    category: "routine",
    categoryLabel: "일상",
    question: "What kind of weather do you like? Why?",
    korean: "어떤 날씨를 좋아하나요? 왜 좋아하나요?",
    goal: "좋아하는 날씨와 그때 하는 행동을 말합니다.",
    simple:
      "I like sunny weather. When it is sunny, I feel good. I usually go outside and take a walk. I also like taking pictures because the sky looks beautiful.",
    simpleKo:
      "저는 맑은 날씨를 좋아합니다. 날씨가 맑으면 기분이 좋습니다. 보통 밖에 나가 산책합니다. 하늘이 아름다워 보여서 사진 찍는 것도 좋아합니다.",
    im:
      "I like sunny but not too hot weather. When the sky is clear, I feel more energetic, and I want to go outside. I usually take a walk near my neighborhood or visit a cafe with big windows. I also enjoy taking pictures because everything looks brighter. Of course, I do not like extremely hot weather, but warm and sunny days make me feel positive.",
    imKo:
      "저는 맑지만 너무 덥지 않은 날씨를 좋아합니다. 하늘이 맑으면 더 에너지가 생기고 밖에 나가고 싶어집니다. 보통 동네 근처를 산책하거나 큰 창문이 있는 카페에 갑니다. 모든 것이 더 밝아 보여서 사진 찍는 것도 즐깁니다. 물론 너무 더운 날씨는 좋아하지 않지만 따뜻하고 맑은 날은 저를 긍정적인 기분으로 만들어줍니다.",
    chunks: [
      ["날씨", "I like ___ weather."],
      ["기분", "When it is ___, I feel ___."],
      ["행동", "I usually ___."],
      ["마무리", "That kind of weather makes me feel ___."],
    ],
  },
  {
    id: "workplace",
    level: "im",
    levelLabel: "IM 목표",
    category: "routine",
    categoryLabel: "일상",
    question: "Describe your workplace or school. What do you do there?",
    korean: "직장이나 학교를 묘사하고, 그곳에서 무엇을 하는지 말해주세요.",
    goal: "장소 묘사와 반복 업무를 자연스럽게 연결합니다.",
    simple:
      "I work in a small office. It is clean and quiet. I usually check emails, make documents, and talk with my coworkers. Sometimes I have meetings in the afternoon.",
    simpleKo:
      "저는 작은 사무실에서 일합니다. 깨끗하고 조용합니다. 보통 이메일을 확인하고 문서를 만들고 동료들과 이야기합니다. 가끔 오후에 회의가 있습니다.",
    im:
      "I work in a small office in Seoul. The office is not very large, but it is clean and organized. My desk is near the window, so I can get some natural light during the day. At work, I usually check emails, organize documents, and communicate with my coworkers. In the afternoon, I sometimes join meetings or prepare simple reports. The work can be repetitive, but I like the fact that my coworkers are helpful and the atmosphere is not too stressful.",
    imKo:
      "저는 서울의 작은 사무실에서 일합니다. 사무실은 아주 크지는 않지만 깨끗하고 정돈되어 있습니다. 제 책상은 창문 근처에 있어서 낮 동안 자연광을 받을 수 있습니다. 직장에서는 보통 이메일을 확인하고 문서를 정리하고 동료들과 소통합니다. 오후에는 가끔 회의에 참여하거나 간단한 보고서를 준비합니다. 일이 반복적일 수는 있지만 동료들이 도움을 잘 주고 분위기가 너무 스트레스 받지 않는다는 점이 좋습니다.",
    chunks: [
      ["장소", "I work/study in ___."],
      ["묘사", "It is ___ and ___."],
      ["업무", "I usually ___, ___, and ___."],
      ["평가", "The work can be ___, but I like ___."],
    ],
  },
];

const roadmap = [
  {
    day: "Step 1",
    title: "한 문장 답변",
    body: "질문 뜻을 한국어로 이해하고 I like, I usually, It is 문장으로 20초를 채웁니다.",
  },
  {
    day: "Step 2",
    title: "이유 붙이기",
    body: "because, so, also를 사용해 이유와 추가 설명을 붙여 40초 답변을 만듭니다.",
  },
  {
    day: "Step 3",
    title: "경험 말하기",
    body: "Last weekend, Recently, One time으로 과거 경험을 넣어 60초 이상 말합니다.",
  },
  {
    day: "Step 4",
    title: "IM 구조",
    body: "답변, 이유 두 개, 예시, 감정 마무리까지 넣어 90초 답변을 연습합니다.",
  },
];

const phraseGroups = [
  {
    title: "시작 문장",
    rows: [
      ["I would say...", "제 생각에는 ...라고 말할 수 있어요."],
      ["To be honest, ...", "솔직히 말하면 ..."],
      ["There are a few reasons.", "몇 가지 이유가 있어요."],
    ],
  },
  {
    title: "이유 연결",
    rows: [
      ["The biggest reason is convenience.", "가장 큰 이유는 편리함입니다."],
      ["It helps me relax.", "그것은 제가 쉬는 데 도움이 됩니다."],
      ["It fits my lifestyle.", "그것은 제 생활 방식에 잘 맞습니다."],
    ],
  },
  {
    title: "경험 꺼내기",
    rows: [
      ["One memorable experience was...", "기억에 남는 경험 하나는 ...였습니다."],
      ["Last weekend, I went to...", "지난 주말에 저는 ...에 갔습니다."],
      ["What I remember most is...", "제가 가장 기억하는 것은 ...입니다."],
    ],
  },
  {
    title: "시간 벌기",
    rows: [
      ["Let me think for a second.", "잠깐 생각해볼게요."],
      ["That is an interesting question.", "흥미로운 질문이네요."],
      ["I have never thought about it deeply, but...", "깊게 생각해본 적은 없지만 ..."],
    ],
  },
  {
    title: "비교하기",
    rows: [
      ["In the past, I used to...", "과거에는 ...하곤 했습니다."],
      ["These days, I mostly...", "요즘은 주로 ...합니다."],
      ["Compared to before, ...", "예전과 비교하면 ..."],
    ],
  },
  {
    title: "롤플레이",
    rows: [
      ["I have a few questions.", "몇 가지 질문이 있습니다."],
      ["Would it be possible to...?", "...하는 것이 가능할까요?"],
      ["Please let me know if that works for you.", "그게 괜찮은지 알려주세요."],
    ],
  },
];

const levelSelect = document.querySelector("#levelSelect");
const categorySelect = document.querySelector("#categorySelect");
const newPromptBtn = document.querySelector("#newPromptBtn");
const promptLevel = document.querySelector("#promptLevel");
const promptCategory = document.querySelector("#promptCategory");
const promptText = document.querySelector("#promptText");
const promptKo = document.querySelector("#promptKo");
const promptGoal = document.querySelector("#promptGoal");
const answerContent = document.querySelector("#answerContent");
const copyAnswerBtn = document.querySelector("#copyAnswerBtn");
const favoriteBtn = document.querySelector("#favoriteBtn");
const masteredBtn = document.querySelector("#masteredBtn");
const mockAddBtn = document.querySelector("#mockAddBtn");
const promptList = document.querySelector("#promptList");
const searchInput = document.querySelector("#searchInput");
const phraseBank = document.querySelector("#phraseBank");
const roadmapEl = document.querySelector("#roadmap");
const statPracticed = document.querySelector("#statPracticed");
const statMastered = document.querySelector("#statMastered");
const statFavorites = document.querySelector("#statFavorites");
const statStreak = document.querySelector("#statStreak");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const dailyChecklist = document.querySelector("#dailyChecklist");
const builderIntro = document.querySelector("#builderIntro");
const builderReason = document.querySelector("#builderReason");
const builderExample = document.querySelector("#builderExample");
const builderFeeling = document.querySelector("#builderFeeling");
const buildAnswerBtn = document.querySelector("#buildAnswerBtn");
const copyBuiltBtn = document.querySelector("#copyBuiltBtn");
const builtAnswer = document.querySelector("#builtAnswer");
const scoreSliders = document.querySelectorAll(".scoreSlider");
const scoreResult = document.querySelector("#scoreResult");
const scoreAdvice = document.querySelector("#scoreAdvice");
const startMockBtn = document.querySelector("#startMockBtn");
const nextMockBtn = document.querySelector("#nextMockBtn");
const resetMockBtn = document.querySelector("#resetMockBtn");
const mockCounter = document.querySelector("#mockCounter");
const mockQuestion = document.querySelector("#mockQuestion");
const mockKorean = document.querySelector("#mockKorean");
const timerMode = document.querySelector("#timerMode");
const timerValue = document.querySelector("#timerValue");
const prepBtn = document.querySelector("#prepBtn");
const answerBtn = document.querySelector("#answerBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const resetBtn = document.querySelector("#resetBtn");
const recordBtn = document.querySelector("#recordBtn");
const playback = document.querySelector("#playback");
const recordStatus = document.querySelector("#recordStatus");
const saveNoteBtn = document.querySelector("#saveNoteBtn");
const phraseNote = document.querySelector("#phraseNote");
const feedbackNote = document.querySelector("#feedbackNote");

let currentPromptIndex = 0;
let activeAnswerTab = "simple";
let timer = null;
let remainingSeconds = 40;
let activeDuration = 40;
let activeMode = "준비 시간";
let mediaRecorder = null;
let chunks = [];
let mockQueue = [];
let mockIndex = -1;

const checklistItems = [
  ["meaning", "질문 뜻 확인", "영어 질문을 한국어로 바꿔 말하기"],
  ["shadow", "쉬운 답변 따라읽기", "왕초보 답변을 3번 소리내기"],
  ["record", "내 답변 녹음", "90초 타이머로 답변 녹음하기"],
  ["review", "피드백 저장", "부족한 표현 1개 메모하기"],
];

const defaultState = {
  practiced: [],
  mastered: [],
  favorites: [],
  checklist: {},
  lastVisit: "",
  streak: 1,
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  const saved = localStorage.getItem("opic-studio-state");
  const state = saved ? JSON.parse(saved) : { ...defaultState };
  const today = todayKey();

  if (state.lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    state.streak = state.lastVisit === yesterdayKey ? (state.streak || 1) + 1 : 1;
    state.lastVisit = today;
    state.checklist = {};
  }

  return {
    ...defaultState,
    ...state,
    practiced: state.practiced || [],
    mastered: state.mastered || [],
    favorites: state.favorites || [],
    checklist: state.checklist || {},
  };
}

let appState = loadState();

function saveState() {
  localStorage.setItem("opic-studio-state", JSON.stringify(appState));
}

function toggleListValue(listName, value) {
  const list = new Set(appState[listName]);
  if (list.has(value)) {
    list.delete(value);
  } else {
    list.add(value);
  }
  appState[listName] = [...list];
  saveState();
  renderDashboard();
  renderCurrentPromptActions();
  renderPromptList();
}

function markPracticed(promptId) {
  if (!appState.practiced.includes(promptId)) {
    appState.practiced.push(promptId);
    saveState();
    renderDashboard();
    renderPromptList();
  }
}

function renderDashboard() {
  const practiced = appState.practiced.length;
  const mastered = appState.mastered.length;
  const favorites = appState.favorites.length;
  const completion = Math.round((mastered / prompts.length) * 100);

  statPracticed.textContent = practiced;
  statMastered.textContent = mastered;
  statFavorites.textContent = favorites;
  statStreak.textContent = `${appState.streak || 1}일`;
  progressBar.style.width = `${completion}%`;
  progressText.textContent =
    completion >= 70
      ? "IM 답변 구조가 꽤 쌓였습니다. 이제 모의시험 반복 구간입니다."
      : completion >= 35
        ? "좋습니다. 경험/비교/롤플레이 질문을 더 완료하면 IM 준비도가 올라갑니다."
        : "아직 시작 단계입니다. 질문 3개를 먼저 연습하세요.";

  dailyChecklist.innerHTML = checklistItems
    .map(
      ([id, title, body]) => `
        <label class="check-item">
          <input type="checkbox" data-check="${id}" ${appState.checklist[id] ? "checked" : ""} />
          <span>
            <strong>${title}</strong>
            <span>${body}</span>
          </span>
        </label>
      `,
    )
    .join("");
}

function renderCurrentPromptActions() {
  const prompt = prompts[currentPromptIndex];
  const isFavorite = appState.favorites.includes(prompt.id);
  const isMastered = appState.mastered.includes(prompt.id);
  favoriteBtn.classList.toggle("active-state", isFavorite);
  masteredBtn.classList.toggle("active-state", isMastered);
  favoriteBtn.textContent = isFavorite ? "즐겨찾기 해제" : "즐겨찾기";
  masteredBtn.textContent = isMastered ? "완료 취소" : "완료 표시";
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderTimer() {
  timerMode.textContent = activeMode;
  timerValue.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function startTimer(seconds, mode) {
  stopTimer();
  remainingSeconds = seconds;
  activeMode = mode;
  pauseBtn.textContent = "일시정지";
  renderTimer();

  timer = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();

    if (remainingSeconds <= 0) {
      stopTimer();
      timerMode.textContent = `${mode} 종료`;
    }
  }, 1000);
}

function getFilteredPrompts() {
  const level = levelSelect.value;
  const category = categorySelect.value;

  return prompts.filter((prompt) => {
    const levelMatches = level === "all" || prompt.level === level;
    const categoryMatches = category === "all" || prompt.category === category;
    return levelMatches && categoryMatches;
  });
}

function pickPrompt() {
  const candidates = getFilteredPrompts();
  const pool = candidates.length > 0 ? candidates : prompts;
  const next = pool[Math.floor(Math.random() * pool.length)];
  currentPromptIndex = prompts.indexOf(next);
  renderCurrentPrompt();
}

function renderCurrentPrompt() {
  const prompt = prompts[currentPromptIndex];
  markPracticed(prompt.id);
  promptLevel.textContent = prompt.levelLabel;
  promptCategory.textContent = prompt.categoryLabel;
  promptText.textContent = prompt.question;
  promptKo.textContent = prompt.korean;
  promptGoal.textContent = prompt.goal;
  renderCurrentPromptActions();
  renderAnswer();
}

function renderAnswer() {
  const prompt = prompts[currentPromptIndex];
  const answerMap = {
    simple: `
      <h4>쉬운 영어 답변</h4>
      <p class="english">${prompt.simple}</p>
      <p class="korean">${prompt.simpleKo}</p>
    `,
    im: `
      <h4>IM 목표 답변</h4>
      <p class="english">${prompt.im}</p>
      <p class="korean">${prompt.imKo}</p>
    `,
    chunks: `
      <h4>내 답변으로 바꾸는 말하기 블록</h4>
      <ul class="chunk-list">
        ${prompt.chunks
          .map(
            ([label, sentence]) => `
              <li>
                <strong>${label}</strong>
                <span>${sentence}</span>
              </li>
            `,
          )
          .join("")}
      </ul>
    `,
  };
  answerContent.innerHTML = answerMap[activeAnswerTab];
}

function getCurrentAnswerText() {
  const prompt = prompts[currentPromptIndex];
  if (activeAnswerTab === "simple") return `${prompt.simple}\n\n${prompt.simpleKo}`;
  if (activeAnswerTab === "im") return `${prompt.im}\n\n${prompt.imKo}`;
  return prompt.chunks.map(([label, sentence]) => `${label}: ${sentence}`).join("\n");
}

async function copyCurrentAnswer() {
  await navigator.clipboard.writeText(getCurrentAnswerText());
  copyAnswerBtn.textContent = "복사 완료";
  setTimeout(() => {
    copyAnswerBtn.textContent = "현재 답변 복사";
  }, 1200);
}

function renderPromptList() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = prompts.filter((prompt) => {
    const haystack = [
      prompt.question,
      prompt.korean,
      prompt.categoryLabel,
      prompt.levelLabel,
      prompt.simple,
      prompt.im,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  promptList.innerHTML = filtered
    .map(
      (prompt) => `
        <article class="prompt-item" data-prompt-id="${prompt.id}">
          <div class="meta-line">
            <span class="pill">${prompt.levelLabel}</span>
            <span class="pill muted">${prompt.categoryLabel}</span>
          </div>
          <h3>${prompt.question}</h3>
          <p>${prompt.korean}</p>
          <p class="card-status">
            ${appState.favorites.includes(prompt.id) ? "저장됨" : "저장 전"} ·
            ${appState.mastered.includes(prompt.id) ? "완료" : "연습 필요"}
          </p>
        </article>
      `,
    )
    .join("");
}

function buildPersonalAnswer() {
  const parts = [
    builderIntro.value.trim(),
    builderReason.value.trim(),
    builderExample.value.trim(),
    builderFeeling.value.trim(),
  ].filter(Boolean);

  builtAnswer.textContent =
    parts.length > 0
      ? parts.join(" ")
      : "빈칸을 채우면 내 답변 초안이 여기에 만들어집니다.";
}

async function copyBuiltAnswer() {
  await navigator.clipboard.writeText(builtAnswer.textContent);
  copyBuiltBtn.textContent = "복사 완료";
  setTimeout(() => {
    copyBuiltBtn.textContent = "만든 답변 복사";
  }, 1200);
}

function updateScore() {
  const total = [...scoreSliders].reduce((sum, slider) => sum + Number(slider.value), 0);
  scoreResult.textContent = `현재 점수 ${total} / 15`;
  scoreAdvice.textContent =
    total >= 12
      ? "좋습니다. 이제 발음보다 끊김을 줄이고 자연스럽게 이어 말하세요."
      : total >= 8
        ? "IM 근처입니다. 예시 하나와 감정 마무리를 더 안정적으로 붙여보세요."
        : "먼저 쉬운 답변을 보고 구조를 따라 말하는 데 집중하세요.";
}

function shufflePrompts() {
  return [...prompts].sort(() => Math.random() - 0.5);
}

function renderMock() {
  if (mockIndex < 0 || mockQueue.length === 0) {
    mockCounter.textContent = "문항 0 / 5";
    mockQuestion.textContent = "질문을 시작하면 여기에 표시됩니다.";
    mockKorean.textContent = "질문 해석도 함께 볼 수 있습니다.";
    return;
  }

  const prompt = mockQueue[mockIndex];
  mockCounter.textContent = `문항 ${mockIndex + 1} / ${mockQueue.length}`;
  mockQuestion.textContent = prompt.question;
  mockKorean.textContent = prompt.korean;
}

function startMock() {
  mockQueue = shufflePrompts().slice(0, 5);
  mockIndex = 0;
  renderMock();
  activeDuration = 40;
  startTimer(activeDuration, "모의 준비");
}

function nextMock() {
  if (mockQueue.length === 0) {
    startMock();
    return;
  }
  mockIndex = Math.min(mockIndex + 1, mockQueue.length - 1);
  renderMock();
  activeDuration = 40;
  startTimer(activeDuration, "모의 준비");
}

function resetMock() {
  mockQueue = [];
  mockIndex = -1;
  renderMock();
}

function addCurrentPromptToMock() {
  const prompt = prompts[currentPromptIndex];
  if (!mockQueue.some((item) => item.id === prompt.id) && mockQueue.length < 5) {
    mockQueue.push(prompt);
  }
  mockIndex = mockQueue.length - 1;
  renderMock();
  document.querySelector("#mock").scrollIntoView({ behavior: "smooth" });
}

function renderRoadmap() {
  roadmapEl.innerHTML = roadmap
    .map(
      (item) => `
        <article>
          <span>${item.day}</span>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderPhraseBank() {
  phraseBank.innerHTML = phraseGroups
    .map(
      (group) => `
        <article class="phrase-card">
          <h3>${group.title}</h3>
          ${group.rows
            .map(
              ([english, korean]) => `
                <div class="phrase-row">
                  <strong>${english}</strong>
                  <span>${korean}</span>
                </div>
              `,
            )
            .join("")}
        </article>
      `,
    )
    .join("");
}

async function toggleRecording() {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "녹음 시작";
    recordStatus.textContent = "녹음이 완료되었습니다. 재생해서 확인해보세요.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", (event) => {
      chunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      playback.src = URL.createObjectURL(blob);
      stream.getTracks().forEach((track) => track.stop());
    });
    mediaRecorder.start();
    recordBtn.textContent = "녹음 중지";
    recordStatus.textContent = "녹음 중입니다. 예시 답변 구조를 떠올리며 말해보세요.";
  } catch (error) {
    recordStatus.textContent = "마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.";
  }
}

function saveNotes() {
  const payload = {
    phrase: phraseNote.value.trim(),
    feedback: feedbackNote.value.trim(),
    prompt: prompts[currentPromptIndex].question,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("opic-studio-notes", JSON.stringify(payload));
  saveNoteBtn.textContent = "저장 완료";
  setTimeout(() => {
    saveNoteBtn.textContent = "메모 저장";
  }, 1400);
}

function restoreNotes() {
  const saved = localStorage.getItem("opic-studio-notes");
  if (!saved) return;

  const payload = JSON.parse(saved);
  phraseNote.value = payload.phrase || "";
  feedbackNote.value = payload.feedback || "";
}

document.querySelectorAll("[data-answer-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    activeAnswerTab = button.dataset.answerTab;
    document.querySelectorAll("[data-answer-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    renderAnswer();
  });
});

promptList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-prompt-id]");
  if (!item) return;

  const nextIndex = prompts.findIndex((prompt) => prompt.id === item.dataset.promptId);
  if (nextIndex < 0) return;

  currentPromptIndex = nextIndex;
  renderCurrentPrompt();
  document.querySelector("#practice").scrollIntoView({ behavior: "smooth" });
});

newPromptBtn.addEventListener("click", pickPrompt);
levelSelect.addEventListener("change", pickPrompt);
categorySelect.addEventListener("change", pickPrompt);
searchInput.addEventListener("input", renderPromptList);
copyAnswerBtn.addEventListener("click", copyCurrentAnswer);
prepBtn.addEventListener("click", () => {
  activeDuration = 40;
  startTimer(activeDuration, "준비 시간");
});
answerBtn.addEventListener("click", () => {
  activeDuration = 90;
  startTimer(activeDuration, "답변 시간");
});
pauseBtn.addEventListener("click", () => {
  if (timer) {
    stopTimer();
    pauseBtn.textContent = "이어하기";
    return;
  }

  if (remainingSeconds <= 0) return;

  startTimer(remainingSeconds, activeMode);
});
resetBtn.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = activeDuration;
  pauseBtn.textContent = "일시정지";
  renderTimer();
});
recordBtn.addEventListener("click", toggleRecording);
saveNoteBtn.addEventListener("click", saveNotes);
favoriteBtn.addEventListener("click", () => {
  toggleListValue("favorites", prompts[currentPromptIndex].id);
});
masteredBtn.addEventListener("click", () => {
  toggleListValue("mastered", prompts[currentPromptIndex].id);
});
mockAddBtn.addEventListener("click", addCurrentPromptToMock);
dailyChecklist.addEventListener("change", (event) => {
  const item = event.target.closest("[data-check]");
  if (!item) return;
  appState.checklist[item.dataset.check] = item.checked;
  saveState();
  renderDashboard();
});
buildAnswerBtn.addEventListener("click", buildPersonalAnswer);
copyBuiltBtn.addEventListener("click", copyBuiltAnswer);
scoreSliders.forEach((slider) => slider.addEventListener("input", updateScore));
startMockBtn.addEventListener("click", startMock);
nextMockBtn.addEventListener("click", nextMock);
resetMockBtn.addEventListener("click", resetMock);

saveState();
renderDashboard();
renderRoadmap();
renderPhraseBank();
renderPromptList();
restoreNotes();
renderCurrentPrompt();
renderTimer();
renderMock();
updateScore();
