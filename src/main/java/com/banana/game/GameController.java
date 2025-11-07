package com.banana.game;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.json.JSONObject;
import java.io.*;
import java.net.URL;

public class GameController {

    @FXML private ImageView puzzleImage;
    @FXML private TextField answerField;
    @FXML private Label resultLabel;

    private int currentSolution;

    @FXML
    private void loadPuzzle() {
        try {
            URL url = new URL("http://marcconrad.com/uob/banana/api.php?out=json");
            BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));
            String response = in.readLine();
            in.close();

            JSONObject json = new JSONObject(response);
            String imageUrl = json.getString("question");
            currentSolution = json.getInt("solution");

            puzzleImage.setImage(new Image(imageUrl));
            resultLabel.setText("");
            answerField.setText("");

        } catch (Exception e) {
            e.printStackTrace();
            resultLabel.setText("Failed to load puzzle");
        }
    }

    @FXML
    private void submitAnswer() {
        try {
            int answer = Integer.parseInt(answerField.getText());
            if(answer == currentSolution) {
                resultLabel.setText("Correct!");
            } else {
                resultLabel.setText("Wrong! Correct: " + currentSolution);
            }
            loadPuzzle(); // Load next puzzle automatically
        } catch (NumberFormatException e) {
            resultLabel.setText("Enter a number!");
        }
    }
}
