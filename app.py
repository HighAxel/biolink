from flask import Flask, render_template, jsonify
import requests
import discord
import threading

app = Flask(__name__)

# Discord Bot Setup
intents = discord.Intents.default()
intents.presences = True  # Required to fetch activities
intents.members = True

bot = discord.Client(intents=intents)

GUILD_ID = '1290447277751533619'  # Specify your guild ID
BOT_TOKEN = 'MTA4MTU1NDcwMTg5NzcxMTY1Nw.GZLxj3.XJ0pUsA3k3rhFscasYFppzwkOf8AimLvjS-gTY'  # Make sure to use your actual bot token

# Start Flask server
@app.route('/')
def index():
    return render_template('profile.html')

@app.route('/user-data/<user1_id>/<user2_id>')
def user_data(user1_id, user2_id):
    headers = {
        'Authorization': f'Bot {BOT_TOKEN}'
    }

    # Helper function to get user data including banner and activities
    # Helper function to get user data including banner and activities
    def fetch_user_data(user_id):
        # Fetch member data (for guild-specific information)
        user_response = requests.get(f'https://discord.com/api/v10/guilds/{GUILD_ID}/members/{user_id}', headers=headers)
        
        if user_response.status_code != 200:
            return None, f"Error fetching user {user_id} data: {user_response.content}"
        
        user_data = user_response.json()

        # Fetch additional user profile data (for banner and more)
        profile_response = requests.get(f'https://discord.com/api/v10/users/{user_id}', headers=headers)

        if profile_response.status_code != 200:
            return None, f"Error fetching user {user_id} profile: {profile_response.content}"

        profile_data = profile_response.json()

        # Prepare user avatar and banner URLs
        avatar_id = user_data['user'].get('avatar')
        avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_id}.png" if avatar_id else "https://cdn.discordapp.com/embed/avatars/0.png"

        banner_id = profile_data.get('banner')
        banner_url = f"https://cdn.discordapp.com/banners/{user_id}/{banner_id}.png?size=512" if banner_id else None

        activities = []
        for activity in user_data.get('activities', []):
            if activity['type'] == discord.ActivityType.custom.value:  # Check for custom activity
                activities.append({
                    'name': activity['name'],
                    'status': activity.get('state', 'No status'),  # Custom status text
                    'type': 'Custom'
                })
            elif activity['type'] == 2:  # Spotify activity
                activities.append({
                    'name': activity['name'],
                    'details': f"Listening to {activity['details']} by {activity['state']}",
                    'type': 'Spotify'
                })
            else:
                activities.append({
                    'name': activity['name'],
                    'type': 'Other'
                })

        return {
            'username': user_data['user']['username'],
            'avatar_url': avatar_url,
            'banner_url': banner_url,
            'activities': activities
        }, None


    # Fetch data for User 1 and User 2
    user1_data, user1_error = fetch_user_data(user1_id)
    user2_data, user2_error = fetch_user_data(user2_id)

    if user1_error:
        return jsonify({'error': user1_error}), 500

    if user2_error:
        return jsonify({'error': user2_error}), 500

    return jsonify({
        'user1': user1_data,
        'user2': user2_data
    })

# Function to run the Flask server
def run_flask():
    app.run(debug=True, use_reloader=False)

# Function to run the Discord bot
@bot.event
async def on_ready():
    print(f'Bot {bot.user.name} is connected to Discord!')

def run_discord_bot():
    bot.run(BOT_TOKEN)

if __name__ == '__main__':
    # Run Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Run the Discord bot in the main thread
    run_discord_bot()
