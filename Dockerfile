# DOCKER-VERSION 1.0.1
FROM	ubuntu:14.04

# Use
# sudo docker build -t lexoyo/silex-docker .
# sudo docker run -p 6805:6805 --name "silex-docker" -d lexoyo/silex-docker
# sudo docker run -i lexoyo/silex-docker


# Install java
RUN	sudo apt-get -y update
RUN	sudo apt-get -y install default-jre
# Install Node.js and npm
RUN	sudo apt-get -y install nodejs
RUN	sudo ln -s /usr/bin/nodejs /usr/bin/node
RUN	sudo apt-get -y install npm
# Open ports
EXPOSE	6805
# Get Silex
ADD	./ /home/Silex/
# RUN	git clone --recursive git@github.com:silexlabs/Silex.git /home/Silex
# Install Silex
RUN	 cd /home/Silex/ ; make
# Run Silex
# CMD ["node", "/home/Silex/dist/server/server.js"]
# Start
CMD	["node", "/home/Silex/dist/server/server.js"]
# RUN	echo -e "\e[0;32mSilex is ready, start it with: \`docker start silex-docker\` and \`open http://0.0.0.0:6805/\` in a browser\e[0m"
