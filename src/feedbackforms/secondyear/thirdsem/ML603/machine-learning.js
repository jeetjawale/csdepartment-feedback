import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { database } from "../../../firebase";
import { ref, set } from "firebase/database";
import { themeJson } from "./theme";
import { json } from "./json";

function MachineLearning() {
    const survey = new Model(json);
    survey.applyTheme(themeJson);

    survey.onComplete.add((sender, options) => {
        const surveyData = sender.data;

        // Extract relevant data
        const { email, fullname, prn, ...allRatings } = surveyData;

        console.log('Survey completed with data:', surveyData);  // Log the survey data

        if (!email || !fullname || !prn) {
            console.error('Missing required fields: email, fullname, or prn');
            alert('Please ensure all required fields (email, fullname, PRN) are filled.');
            return;
        }

        // Get current date and time
        const currentDate = new Date();
        const date = currentDate.toLocaleDateString(); // e.g., "5/27/2024"
        const time = currentDate.toLocaleTimeString(); // e.g., "10:00:00 AM"

        // Organize ratings into categories with full names
        const ratings = {
            "General Course Management": {},
            "Learning Environment": {},
            "Course Outcome Attainment": {},
            "Instructor Characters": {},
            "Suggestions": {}
        };

        for (const [questionKey, rating] of Object.entries(allRatings)) {
            const prefix = questionKey.split('question')[0];
            switch (prefix) {
                case 'gcm':
                    ratings["General Course Management"][questionKey] = rating;
                    break;
                case 'le':
                    ratings["Learning Environment"][questionKey] = rating;
                    break;
                case 'coa':
                    ratings["Course Outcome Attainment"][questionKey] = rating;
                    break;
                case 'id':
                    ratings["Instructor Characters"][questionKey] = rating;
                    break;
                case 'suggest':
                    ratings["Suggestions"][questionKey] = rating;
                    break;
                default:
                    break;
            }
        }

        // Save to Firebase Realtime Database under respective categories
        const newSurveyRef = ref(database, `ThirdYear/SixthSemester/BTCOC603:Machine Learning/${prn}`); // Use PRN as key
        set(newSurveyRef, {
            email,
            fullname,
            ratings,
            date,  // Add date to the data being saved
            time   // Add time to the data being saved
        }).then(() => {
            console.log('Survey data saved successfully!');
        }).catch((error) => {
            console.error('Error saving survey data:', error);
        });
    });

    return (
        <Survey model={survey} />
    );
}

export default MachineLearning;