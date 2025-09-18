## PET MAZE MADNESS
A thrilling gyroscope-controlled maze game built with React Native and Expo. 
This project was created as a school assigment designed to encourage us students to explore React Native core components and Expo SDK components, and will not be developed any further.

## How to Play 🎮
Guide your pet through dangerous mazes using your device's motion sensors.
Start the game by pressing "STARTA" on the main menu.
Tilt your device in ALL different directions guide the pet through the maze to the house.
Avoid red walls - they explode and your pet will die a horrible death! 💀

# Tech Stack 🛠 
Framework: React Native + Expo
Language: TypeScript
Build Tool: Expo CLI
Styling: Using StyleSheet
Icons: https://icons.expo.fyi/Index
Dev Testing App: Expo Go
Emulator: Android Studio

Used React Native Core Components: //TODO fyll i alla
- [X] StatusBar: Used on startScreen to show battery status, and Title on some pages
- [X] TouchableOpacity: Custom styled buttons and interactive elements
- [X] View: Layout and container components
- [X] Text: Display text
- [X] ActivityIndicator: Spins to indicate buffering when starting game
- [X] Image: For game logotype on startScreen
- [ ] TextInput: User input (pet name)

Used Expo SDK 54 Components: //TODO fyll i alla
- [ ] Gyroscope (expo-sensors): Motion detection for game controls
- [ ] Haptics (expo-haptics): Vibration feedback system
- [ ] Audio (expo-audio): Sound effects management
- [ ] ?
- [ ] ?

Other External modules/APIs used: //TODO
- [ ] ?
- [ ] ?

## Installation 🚀 //TODO
1. Clone repository:
git clone https://github.com/ChrBlo/PetMazeMadness
2. Install dependencies:
npm install
3. Install required Expo packages //TODO
npm install expo-sensors expo-haptics expo-audio expo-status-bar
4. Start dev server
npm start


## ASSIGNMENT (from teacher)
För att bli godkänd på den här uppgiften MÅSTE du använda GIT och GitHub.
Inlämningen sker som vanligt via läroplattformen. I din projektmapp ska det finnas
(utöver all kod) en README.md fil. Den ska innehålla:
   - [ ] titel
   - [ ] beskrivning av projektet
   - [ ] info om hur projektet byggs och körs 
   - [ ] samt vilka uppgiftskrav som är uppfyllda. 
- [ ] Kom ihåg att .git mappen måste finnas så jag kan hitta till ditt publika repo.

Presentation
Du ska i samband med inlämning hålla i en presentation där du för klassen presenterar:
- [ ] din applikation
- [ ] vilka komponenter du har använt 
- [ ] kort beskriva vad dom används till
- [ ] här kan det var intressant att visa lite kod kring några utvalda komponenter. 
- [ ] Du ska även presentera hur du har planerat, genomfört och strukturerat ditt arbete. 
- [ ] Dessutom ska presentationen innefatta en reflekterande del. 
Presentationen kommer att ske i mindre grupper under presentationsdagen - du kommer att ha ca 10 minuter att presentera på.

Krav för godkänt:
- [X] Projektet använder minst 4 stycken RN-komponenter 
- [ ] Projektet använder minst minst 4 stycken Expo komponenter.
- [ ] De utvalda komponenterna MÅSTE antecknas i README filen tillsammans med en lista över genomförda krav.
- [ ] React Navigation används för att skapa en bättre upplevelse i appen.
- [ ] Git & GitHub har använts
- [ ] Projektmappen innehåller en README.md fil - (läs ovan för mer info)
- [ ] Uppgiften lämnas in i tid!
- [ ] Muntlig presentation är genomförd

Krav för väl godkänt:
- [ ] Alla punkter för godkänt är uppfyllda
- [ ] Ytterligare en valfri extern modul används i projektet (ex. react-hook-form).
- [ ] Appen ska prata med ett Web-API för att hämta data.
- [ ] Appen ska förberedas för lansering till en Appstore (Deadline samma dag som kursen slutar)



## Acknowledgments ⭐ 
https://reactnative.dev/docs/components-and-apis#basic-components
https://docs.expo.dev/versions/latest/
https://icons.expo.fyi/Index
Sound effects from freesound.org //TODO add links to used sounds

## Device Requirements📱 //TODO
Physical device required - Gyroscope sensors don't work in simulators
iOS or Android with gyroscope support
Expo Go app for dev testing

## Customization 🔧 //TODO