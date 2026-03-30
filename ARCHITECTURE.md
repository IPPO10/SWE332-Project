# Fitness Hub - Software Architecture

## 1. Scope
The Fitness Hub system is a web-based application designed to help users monitor their daily physical activity and maintain a healthier lifestyle. The system will allow users to track steps, estimate calories burned, and view their daily progress through a simple interface.
The scope of this project focuses on basic fitness tracking features and does not include advanced integrations such as real-time sensor data or external health device synchronization. 

## 2. References
- Course lecture slides from SWE332 Software Architecture
- The 4+1 Architectural View Model by Philippe Kruchten
- GitHub Markdown Guide
- Online resources related to web-based system design
## 3. Software Architecture
The Fitness Hub system follows a simplified version of the 4+1 architectural view model. The system is designed as a web-based application that separates the user interface, application logic, and system structure into different views.

The architecture focuses on clarity and simplicity, allowing each part of the system to be easily understood and developed. The main components include the user interface (frontend), the logic for handling user input and calculations, and the structure used to organize the project files.

This approach helps ensure that the system is easy to maintain, scalable for future improvements, and suitable for a small-scale project developed within a limited time.
## 4. Architectural Goals & Constraints
### Goals
- Provide a simple and user-friendly interface
- Ensure the system is easy to develop and maintain
- Allow users to easily track and view their daily activity
- Keep the system lightweight and responsive

### Constraints
- The system will be developed as a web-based application
- Limited time and resources as this is a course project
- No use of advanced external APIs or hardware integrations
- The system will focus on core features only (steps and calorie estimation)

## 5. Logical Architecture
The Fitness Hub system is divided into three main components, where each component has a specific role in the system.

1. Frontend (User Interface)
This is the part that the user interacts with directly. It allows the user to enter the number of daily steps and view the results such as calories burned and daily progress.

2. Application Logic
This component is responsible for processing the user input. It takes the number of steps entered by the user and calculates the estimated calories burned using a simple formula. It also prepares the data to be shown on the interface.

3. Data Storage
This part stores the user’s data, such as the number of steps, calculated calories, and the date. It helps keep track of daily activity over time.


## 6. Process Architecture
The Fitness Hub system follows a simple and clear process flow. It is designed to handle user actions in a direct and sequential way.

1. User Input
The user opens the web application and enters the number of steps for the day.

2. Data Processing
The system receives the input and calculates the estimated calories burned based on the entered steps.

3. Data Storage
After processing, the system saves the data for future reference and tracking.

4. Output Display
The system displays the results immediately, including steps and calories burned.

## 7. Development Architecture
Frontend:

The frontend is the part users interact with.

.Login and registration pages
.User dashboard
.Calories tracker page
.Workout page
.Profile page
.Responsive design for mobile and desktop

Backend:

The backend handles the system logic and data processing.

.User authentication
.Calories calculation
.Workout tracking
.Goal setting
.Data storage management
.Database

The database stores user information and fitness records.
User details
.Calories consumed
.Calories burned
.Workout history
.Fitness goals
.Main Feature

## 8. Physical Architecture
The physical architecture of Fitness Hub includes the hardware and devices needed for the system to work. Users can access the website through a computer, laptop, tablet, or smartphone. They use input devices such as a keyboard, mouse, or touchscreen to enter information like calories, workouts, and fitness goals.

The system displays information through output devices such as monitors and smartphone screens. All user requests are processed through a web server and application server, which handle login, calorie calculations, and workout tracking.
## 9. Scenarios
(To be filled)

## 10. Size and Performance
(To be filled)

## 11. Quality
(To be filled)
