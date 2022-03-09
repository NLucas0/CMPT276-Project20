# CMPT276-Project20Proposal

## Project Name: 
All-in-one Duel Links Draft (AIO DLD)
___

## Abstract:

AIO DLD will be an online application for users to open card packs from different Yu-Gi-Oh Duel Links boxes. Cards obtained through these packs will be stored in a database based on a username and password. Furthermore, users may use these cards to trade with other users, build decks, and view the prices of these cards through a card database. Though this application can be used as an educational tool to practice building decks with randomized packs of cards, it is primarily used as a tool to organize draft play itself by combining the tools to open packs and build decks into one application.
___
## Links:
- Heroku Application: https://all-in-one-duel-links-draft.herokuapp.com/

- Github Repository: https://github.com/NLucas0/CMPT276-Project20

- Existing systems (APIs):

    - https://yugiohprices.docs.apiary.io/#
 
    - https://db.ygoprodeck.com/api-guide/

___
## Features:

### Pack Opening simulator

Users can open randomly-generated packs of cards from a few specified boxes from the card game Yugioh Duel Links. The user will be able to see all the cards they obtained from the packs opened this session, as well as be able to reset the box packs. The cards opened from this pack will be saved based on an account as explained in the next feature.

### Account

To save individual data, the user can create an account which will be linked to their email. Each account can be customized with a profile picture and username, both of which can be changed at any point in time. Passwords can also be reset, and other users can also be added into a friends list.

### Trade cards

Users will be able to trade cards obtained through the pack opening simulator through either a friend list or username search. A user may select several cards to offer in a trade. They may also select cards from the receiver’s collection that the offeror wants in return. When a trade offer is made, the receiver will receive a notification, see the proposed trade, whereupon they may accept or decline. The total card values of each side are displayed during the trade.

### Deck builder

Using the cards opened in the Pack Opening Simulator and stored on their account, users can organize those cards into decks, for organization and experimentation. This is where users can view all the cards they have opened from the Pack Opening Simulator, and can also show which cards they had opened on specific days, to differentiate which sessions they opened which cards. Users can also create multiple decks, give each deck a unique name and short description, and can even show their decks to other users, which can be used to compare decks with others.

### View and compare prices for cards

To help users of the site judge trades and find strong cards for decks they’re building, the site will display up to date pricing information displayed cards. This information is accessible on all pages of the site, for any card the user views. In addition, this data will be used to show the user pertinent information, such as the total value of their decks, or the relative value of a trade request.

___
## Do we have a clear understanding of the problem?

### How is this problem solved currently (if at all)?

Yugioh Duel Links players who wish to play draft format currently must use separate websites to pull cards from the packs, and to build the decks, or spend their limited currency in game. Our website will be putting these together into one cohesive application, so that everything except actually playing with the cards can be done in one place.
Pricing data for cards is available on the site to help inform the user of card value within the community.

### How will this project make life better? Is it educational or just for entertainment?

So that Duel Links players can get to the play faster and easier, this application will make organizing and practicing the draft format easier.

### Who is the target audience? Who will use your app or play your game?

The target audience is Yu-Gi-Oh players, specifically of the Duel Links draft format
___
## What is the scope of your project?

### Does this project have many individual features, or one main feature (possibility with many subproblems)? These are the ‘epics’ of your project.

Many individual features that revolve around the experience of organizing Yugioh Duel Links draft play

### The main features of our application are:

Simulating opening Yu-Gi-Oh packs, creating an account to store card data, trading cards, building decks, simulating drafts and comparing card prices. All features will be implemented using APIs for card information.

### What are some sample stories/scenarios? For example, as a regular user to your site, what types of things can I do?  These are the ‘stories’ of your project.

Creating an account:

Bob wants to access the application and save his data. He opens the website and navigates to the account creation page, where he can use his email as a username. He inputs a valid password and submits, successfully creating an account. Later, he can choose to modify his profile image, username and password. If he ever forgets the password, email can be used to reset it.

Pack Opener:

Bob wants to play Duel Links draft with a couple friends, but since Duel Links is a digital card game, he doesn’t have physical packs to open with his friends. So, he and his friends navigate to the Pack Opening portion of this application. With intuitive controls, they open the number of packs agreed on by the group. All cards pulled from these packs are stored on their individual databases and can be viewed later.

Deck Building: 

Bob has a collection of cards saved on the website, and has an idea for a new deck he wants to build. He opens the app and navigates to his deck collection. Creating a new deck, he gives it a name and an optional short description to help remember his idea later.

He is then shown his available cards. To easily find the ones he wants, these shown cards can be searched, filtered and sorted. Additionally, the tool provides information—such as the balance of monster cards to other kinds of cards—on the selected cards to help guide his choices. After selecting all the cards he wants to add to his deck, he saves his work, allowing him to find and view the deck again later. 

Trading Cards:

Bob and his friends have just exited the pack opener and have moved on to deck building. As he’s picking out cards for his deck, Bob realizes he’s missing a key card for the deck he’s working on. He navigates to the trade interface and searches for his friend, Greg, by entering his username. Upon finding his friend, he’s shown their two collections side by side. Within Greg’s collection, he spots the card he needs to complete his deck, and notices that a card in his own collection would synergize well with several of Greg’s cards. Bob selects the card(s) from his own collection to offer, as well as the card(s) from Greg’s that he wishes to receive, and presses send.
    
 A moment later, Greg receives a notification in the application that he has a trade request. Clicking “view”, Greg is shown the card(s) Bob is asking for and offering in return. Happy with the trade, he clicks “accept” and is returned to the main page with the newly traded cards now available to him.
<br/><br/>
Pricing Data:

 Bob is a new player, looking to play with his more experienced friends. He worries about struggling against the rest of the group and being tricked into giving up good cards in a trade. To help Bob compete, the website displays the current price of any displayed card. Though these prices are from the physical game, and the cards themselves are not real, the data informs Bob which cards are generally considered better and worse. In the deck builder, Bob can quickly find his most valuable cards and begin building the rest of his deck around them. When offered a trade deal, Bob is able to quickly check if the deal is fair, by comparing the total values of the two sides.

 
### Be honest, is the amount of work required in this proposal enough for five group members?

The amount of work required is appropriate for five group members, as there are five major features that each member can spearhead.