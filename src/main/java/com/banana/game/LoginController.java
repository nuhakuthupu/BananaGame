package com.banana.game;

import javafx.fxml.FXML;
import javafx.scene.control.*;

public class LoginController {

    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private Label messageLabel;

    @FXML
    private void handleLogin() {
        String user = usernameField.getText();
        String pass = passwordField.getText();

        // Hardcoded for demo (virtual identity)
        if(user.equals("Ada") && pass.equals("hello23")) {
            messageLabel.setText("Login successful!");
            // TODO: Open game window
        } else {
            messageLabel.setText("Invalid credentials!");
        }
    }
}
