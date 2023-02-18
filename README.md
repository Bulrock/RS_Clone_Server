# RS Clone Server API  
  - **Register new User:** ***POST request with body:***  
  { 'username': 'User_Name', 'password': '12345' }  
  on 'https://rsclonetestserver-production.up.railway.app/user/register'
  - **Login User:** ***POST request with body:***  
{ 'username': 'User_Name', 'password': '12345' }  
on 'https://rsclonetestserver-production.up.railway.app/user/login'  
  - **Check existence of Username:** ***POST request with body:***  
{ 'username': 'User_Name', }  
on 'https://rsclonetestserver-production.up.railway.app/user/check'  
  - **Add current game score to User's scores statistic:** ***POST request with body:***  
{ 'username': 'User_Name', 'gamename': 'tetris', 'score': 1 }  
on 'https://rsclonetestserver-production.up.railway.app/user/addscore'  
  - **Add current game score to TOP10 game scores statistic:** ***POST request with body:***  
{ 'username': 'User_Name', 'gamename': 'tetris', 'score': 1 }  
on 'https://rsclonetestserver-production.up.railway.app/top/addscore'  
  - **Get current user scores with sorting ability:** ***POST request with body:***  
{ 'username': 'User_Name', 'option': 'ascScore'/'descScore'/'ascGame'/'descGame'/ }  
on 'https://rsclonetestserver-production.up.railway.app/user/scores'  
  - **Get specified game TOP10 with sorting ability:** ***POST request with body:***  
{ 'gamename': 'tetris', 'option': 'ascScore'/'descScore'/'ascName'/'descName'/ }  
on 'https://rsclonetestserver-production.up.railway.app/game/top10'  
