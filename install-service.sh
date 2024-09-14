 #!/bin/bash
 
 sudo systemctl daemon-reload
 sudo systemctl enable $PWD/ddmbot.service

sudo systemctl start ddmbot.service

