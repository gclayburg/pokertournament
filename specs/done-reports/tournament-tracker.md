 OK, we went to build a web application that we can use to track a poker tournament so it's the poker we're playing is no limit Texas hold them. We're playing a tournament style where each player gets the set number of chips to start out with we start out with 10,000 chips and proceed through different levels so the first 20 minutes they're all in 20 minute levels but we want to adjust for that so the first level is, the small line is 25 and the big one is 50. The next level is small line is 15 next level is our next. The big blind is 100 and it proceeds on that I'll type those out later in this document can see what the different levels are, but the way this works is every 20 minutes the blinds change it goes up and the point of this tracker is the track what is the blind level currently at for the game so at the beginning of the game, we press start on this application and it starts on a timer for 20 minutes down to zero and then it's going to change over to the next level, it's gonna have some kind of a audio alert to notify that the blinds are going up to the next level and it probably needs about a minute warning before it goes up to cut some kind of audio level alert to say the blinds are going up to the next level once that one minute is expired screen as a change and show the current level at the time so the next level would be this example 5100 and that's pretty much what this has to do as a track some other things to about about some facts about the game that you see on the screen yeah

 levels
 25/50
 50/100
 100/200
 150/300
 200/400
 break
 300/600
 400/800
 500/1000
 1000/1500
 1500/3000
break
 2000/4000
3000/6000
4000/8000
5000/10000

These levels also need to be configurable, so there needs to be some edit screen where the controller of the game can choose their own level levels so these are suggested levels here, but it should be easy for someone to edit the levels to change the amounts the small wine in the big and also the number of levels and where the brakes are and that sort of thing so I need it would be a separate screen, so some navigation controls the bottom of the screen so somebody can click the added button at the tournament course that this has to happen before the tournament starts so once the tournament starts, they cannot be edited like that, but there are some controls during the tournament so the administrator can do things like pause the tourname during a break just bypass a break and start anyway because people are ready to play those controls should be allowed yeah and also if you it should be possible for the administrator to go into an edit screen and just go back level like go back see you at 200 400 to go back to one 5300 and also separate remaining time so normally it would be like a 20 minute level but maybe the term directory side we're gonna go back and we're gonna put five minutes on the clock at t so you should just accept that and go for so once you hit the edit and go again the countdown starts again in a tournament on yeah that's it

As far as security goes, we're not going to have any real security here we just assume whoever has access to use the keyboard as is able to be the administrator and change how tournament works or pause or start or stop or edit or anything so we're not gonna have any authentication layer at this stage

So the default out of the box the default settings are basically when you first start up it should display that the tournament structure all the different levels that are available and I'm brief description they're gonna be 20 minute levels and one of the options is to push go or make a called start so if somebody pushes start the tournament starts at the 2550 level right there now we can also instead of hitting go. We can also do things like change the number chang change the timing so instead of 20 minute levels that can make it 30 minute levels but or 15 minutes or whatever so that the director can change that as one setting for how long each level should be multiple change the complete line structure too so another setting that we need to have in there is at the very first train is the number of entrance so we'll do a number of e as a text field also said there's 10 people there we should be able to put that in there, and that the code or the display should show us about the expected amount of time this tournament should take to where we get to one person remaining to win, and you can do an estimate based on chips and play at the time and compared to the blinds. It's gonna be in place at the tournament so it kind of use a term director away to estimate estimate. How long is it gonna last?

