import telebot
import os
import zipfile
from datetime import datetime

# Initialize bot with your bot token
bot = telebot.TeleBot("7689350341:AAF79Flb_x_8-kGkZb_LmNXPvSfF1afRaYI")

# Directory to zip and send (current working directory)
directory_path = os.getcwd()

# /d command handler
@bot.message_handler(commands=['d'])
def send_directory_zip(message):
    # Create a zip file with the current timestamp to avoid overwriting
    zip_filename = f"files_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

    try:
        # Create a zip file
        with zipfile.ZipFile(zip_filename, 'w') as zipf:
            # Iterate through files in the current directory and add to zip
            for root, dirs, files in os.walk(directory_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, arcname=file)

        # Send the zip file to the user
        with open(zip_filename, 'rb') as zip_file:
            bot.send_document(message.chat.id, zip_file)
    
    except Exception as e:
        bot.reply_to(message, f"Error zipping files: {e}")

    finally:
        # Clean up the zip file after sending
        if os.path.exists(zip_filename):
            os.remove(zip_filename)

# Start polling
bot.polling()
