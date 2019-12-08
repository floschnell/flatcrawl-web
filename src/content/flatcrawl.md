# flatcrawl

## about

The purpose of the flatcrawl project is to **collect flats from different rental sites** and **expose them in a consistent shape**. Eventually it lets users define **custom searches** and provides them with **instant updates on new matching flats**.

This is an open source project on GitHub, [go, check it out and contribute](https://www.github.com/floschnell/flatcrawl).

## features

- 📣 Searches many different flat rental sites at the same time
- ⚡ Immediately forwards new flats that match your search criteria
- 🚴 Calculates travelling distances from the flat found to your key places in the city
- 👬 Get the matches delivered into group conversations and immediately share & discuss it with your future flatmates
- ⚙️ Manage your searches either through the chatbot or a web interface.

## requirements

Currently only one output channel is available through [Telegram](https://www.telegram.org). However, in the future it is planned to have further communication channels available like mail or slack.

## usage

### creating a search

To create a search, you need to get in touch with the [flatcrawlBot](https://telegram.me/flatcrawlBot). You can search for it and communicate with it like with any other contact in Telegram. Use the app's search field and look for [flatcrawlBot](https://telegram.me/flatcrawlBot) ... or simply click the link, if you are reading this on the right device already. Once found, simply open up a conversation with it.

Right now the bot is capable of a few commands that you can simply type into the conversation window. To start a search, type `/search`. Afterwards, the bot will ask you some questions to determine your search criteria. Eventually, it will only forward you offers that match your settings.

<figure>
<img alt="An Example Conversation with the Flat Crawling Bot" src="./img/start_search.gif" />
<figcaption>An example conversation with the flatcrawlBot.</figcaption>
</figure>

Once the search is setup, the bot will output a numeric ID. Remember it. The bot will not start to send flats right away! This is because you might want to be notified within a group, so that all your potential flatmates receive the offers as well and you can discuss the adverts while they keep popping in.

### subscribing to a search

To continuously receive new flats that match your search criteria, first go to the chat or group conversation where you would like to be notified. Then open the chat menu and add a new member. Search and choose the *flatcrawlBot*.

Then, back in the chat, you just need to enter `/subscribe`. From the list that comes up, choose the one with the ID that you remembered before.

That's it, now you will receive all the new flat offers as soon as they get posted on any of the supported rental sites.

### unsubscribing

You can always check which subscriptions are active in a certain chat using the `/subscriptions` command.

In order to unsubscribe, type `/unsubscribe <id>`. Replace `<id>` with the search ID, that you want to remove from this chat.