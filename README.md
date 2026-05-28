# ICT171-WebServer-CardBashD
ICT171 Assignment 2 GitHub repository for CardBashD Web Server Project by David Basham | 34097027

### What is it?
CardBashD is a JavaScript based card game that contains 3 modes:
  - Higher Or Lower Card
  - Memory Match
  - Blackjack

This project is meant to be deployed as a webserver.

## How to deploy
1. Set up a linux enviroment (Ubuntu Server Reccommended)
2. Download `deploy.sh`
3. Run `sudo chmod +x deploy.sh` then `sudo ./deploy.sh`
4. The script by default will:
   - Update the system
   - Install Nginx
   - Install Git if not already installed
   - Create a web root directory at `/var/www/ICT171-WebServer-CardBashD`
   - Clones the repo
   - Set permissions
   - Create a configuration file for Nginx
   - Enable and start Nginx on startup
5. Test by opening a web browser and typing either `127.0.0.1` or your servers public ip if on a remote locations such as AWS or Azure

If done correctly, the website should be live
