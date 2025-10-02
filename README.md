## PET MAZE MADNESS 🐹
A thrilling maze game built with React Native and Expo. 
This project was created as a school assigment designed to encourage us students to explore React Native core components and Expo SDK components, and will not be developed any further.

## How to Play 🎮
Guide your pet through dangerous mazes using your device's motion sensors.
Start the game by pressing "STARTA" on the main menu.
Tilt your device in ALL different directions guide the pet through the maze to the house.
Avoid dangers - your pet will die a horrible death! 💀

## Repository
This project can be found here: https://github.com/ChrBlo/PetMazeMadness

## Tech Stack 🛠 
Framework: React Native + Expo
Language: TypeScript
Build Tool: Expo CLI
Styling: Using StyleSheet
Icons: https://icons.expo.fyi/Index (Ionicons)
Dev Testing App: Expo Go
Emulator: Android Studio

## Used Components ⚙️
Used React Native Core Components:
- [X] StatusBar: Used on startScreen to show battery status
- [X] TouchableOpacity: Custom styled buttons and interactive elements
- [X] View: Layout and container components
- [X] Text: Display text
- [X] ActivityIndicator: Spins to indicate buffering when starting game
- [X] Switch: For game settings, like weather-block etc.
- [X] TextInput: User input (pet name)
- [X] Modal: Pet selection and pet name edit
- [X] ScrollView: used inside modal for pet selection & maze[id] statistics screen
- [X] FlatList: used to list top 10 records in maze statistics

Used Expo SDK 54 Components:
- [X] Gyroscope (expo-sensors): Game controls - CHAOS mode
- [X] Accelerometer (expo-sensors): Game controls - NORMAL mode
- [X] Haptics (expo-haptics): Vibration feedback
- [X] Audio (expo-audio): Sound effects
- [X] Image: For game logotype on startScreen and rocks/fire in maze
- [X] Ionicons: used in gameScreen on button navigation user to maze stats
- [X] LinearGradient (expo-linear-gradient): for button style
- [X] Blur (expo-blur): For not yet cleared maze levels in maze-statistics

Other External modules/APIs used:
- [X] yr.no weather forecast open API (https://developer.yr.no/doc) - Used in a game settings that blocks game if nice weather
- [X] added react-native-simple-store for storing score data
- [X] added jotai for simpler state handling (fixed bug with walls beeing hit several times)
- [X] added LottieView (lottie-react-native) from LottiFiles - added animation on maze-completion 


## Installation 🚀
1. Clone/fork repository:
git clone https://github.com/ChrBlo/PetMazeMadness
2. Install dependencies:
npm install
3. Start server
npm start
4. NOTE that the app does not work on an emulator, 

## Device Requirements📱 
Physical device required - Gyroscope sensors don't work in simulators
(iOS or Android with gyroscope/accelerometer-support)
Expo Go app for dev testing

## ASSIGNMENT (from teacher) 🖋️
För att bli godkänd på den här uppgiften MÅSTE du använda GIT och GitHub.
Inlämningen sker som vanligt via läroplattformen. I din projektmapp ska det finnas
(utöver all kod) en README.md fil. Den ska innehålla:
   - [X] titel
   - [X] beskrivning av projektet
   - [X] info om hur projektet byggs och körs 
   - [X] samt vilka uppgiftskrav som är uppfyllda. 
- [X] Kom ihåg att .git mappen måste finnas så jag kan hitta till ditt publika repo.

Presentation
Du ska i samband med inlämning hålla i en presentation där du för klassen presenterar:
- [X] din applikation
- [X] vilka komponenter du har använt 
- [X] kort beskriva vad dom används till
- [X] här kan det var intressant att visa lite kod kring några utvalda komponenter. 
- [X] Du ska även presentera hur du har planerat, genomfört och strukturerat ditt arbete. 
- [X] Dessutom ska presentationen innefatta en reflekterande del. 
Presentationen kommer att ske i mindre grupper under presentationsdagen - du kommer att ha ca 10 minuter att presentera på.

Krav för godkänt:
- [X] Projektet använder minst 4 stycken RN-komponenter 
- [X] Projektet använder minst minst 4 stycken Expo komponenter.
- [X] De utvalda komponenterna MÅSTE antecknas i README filen tillsammans med en lista över genomförda krav.
- [X] React Navigation används för att skapa en bättre upplevelse i appen.
- [X] Git & GitHub har använts
- [X] Projektmappen innehåller en README.md fil - (läs ovan för mer info)
- [ ] Uppgiften lämnas in i tid!
- [ ] Muntlig presentation är genomförd

Krav för väl godkänt:
- [X] Alla punkter för godkänt är uppfyllda
- [X] Ytterligare en valfri extern modul används i projektet (ex. react-hook-form).
- [X] Appen ska prata med ett Web-API för att hämta data.
- [ ] Appen ska förberedas för lansering till en Appstore (Deadline samma dag som kursen slutar)


## Acknowledgments ⭐ 
https://reactnative.dev/docs/components-and-apis#basic-components
https://docs.expo.dev/versions/latest/
https://icons.expo.fyi/Index
https://jotai.org/docs
Animations from https://lottiefiles.com/free-animation/
- https://lottiefiles.com/free-animation/success-confetti-f5PdexvrBK - used on maze-completion
Sound effects from https://pixabay.com
- https://pixabay.com/sound-effects/search/fart/ - used sound file called: "fart"
- https://pixabay.com/sound-effects/search/woopee/ - used sound file called: "woopee.."
- https://pixabay.com/sound-effects/search/plop/ - used sound file called: "plopp"
- https://pixabay.com/sound-effects/search/woopee/ - used sound file called: "woopee.."

