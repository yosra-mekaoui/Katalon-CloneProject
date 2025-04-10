from WebUI.BuiltinKeywords import WebUiBuiltInKeywords as WebUI

def beforeEach():
    print("Running beforeEach hook...")

def afterEach():
    print("Running afterEach hook...")

def test_facebook_login():
    WebUI.openBrowser("http://facebook.com")
    WebUI.setText("email_field", "test@example.com")
    WebUI.setText("password_field", "password123")
    WebUI.click("login_button")
    WebUI.verifyTextPresent("Welcome", True)
    print("Login test completed")
