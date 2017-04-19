# anv - Any Node Version

A node version switcher built with [electron]().

A node version switcher should be:

1. Easy to install
2. User specific
3. Cross platform
4. Written in javascript (and open source)

...At least this node version switcher aims to be all of these.

## Why

I like [n](), but it's just a bash shell script, so it depends on having a bash shell to run it. It is also limited in what it can tell you when something goes wrong. I much prefer writing and maintaining javascript to writing and maintaining shell scripts, but there's a chicken and egg problem - I need node to run javascript command line tools. Similar challenges exist for [nvm](), [give]() and other node version managers. Using [electron]() to build a node version manager works around all three of these issues - it builds cross platform, it can provide an extensive, informative UI (GUI where available), and it can be written in javascript, but is prepackaged with it's interpreter (at the cost of a relatively hefty download for a fairly simple tool). Also, a version switcher should be dead simple to install and manage versions for a single user.

It is also a fairly simple application for learning about building, packaging, and delivering updates to an electron app.
