# vim-be-good

Vim be good is a plugin designed to make you better at vim by creating a game
to practice basic movements in.

## Programmed with Love and Fury

and tunes https://www.youtube.com/watch?v=emOKaGi8u5U

## WARNING

-   The code is a heaping pile of awfulness. It was developed live on Twitch,
    which means I did not carefully think through anything other than memes.
-   If you wish to create your own game, look at how relative is done.
    Everything else should be straight forward, except for the parts that are
    not.

## Difficulty

The difficulty only works on a few games for now. Still a work in progress,
if you have any ideas, please submit them either as tickets or as a PR.

## Ideas?

Please submit a ticket for your idea!!!

## Options

### Games - relative

By default vim be good returns random offset for game difficulty above noob, if
you wish to set fixed offset set `vim_be_good_delete_me_offset` to desired
value.

`let g:vim_be_good_delete_me_offset = 35`

## Instructions are at the top of games.

here too!

To play `relative` you need to delete the line that
says `DELETE ME`. Use relative jumps

To play `ci{` you need to replace the contents
inside the _first_ { or [ with bar. HINT, use ci[
or ci{ and type bar.

To play `whackamole` you need to navigate to the character with the caret under
it as fast as possible. Once you have reached the character, flip the
character's case to complete the round.

## Installation

## MUST USE NEOVIM 5.x!!!!!!

1. Use your favorite plugin manager to install! Only works on Nvim, the one true
   vim.

```viml
Plug 'ThePrimeagen/vim-be-good'
```

### Docker

If you would like, you can use docker to run the game. Doing this will
automatically use the correct version of neovim for you, as well as run the
game immediately when neovim starts.

#### Stable image

[This image](https://github.com/brandoncc/docker-vim-be-good/blob/master/stable/Dockerfile) always runs the version of the game that was bundled when the image
was built. Images are generally built within one day of the main branch
receiving new commits, but you won't get the new images unless you manually run
`docker pull brandoncc/vim-be-good:stable` periodically.

```bash
docker run -it --rm brandoncc/vim-be-good:stable
```

#### "Latest" image

[This image](https://github.com/brandoncc/docker-vim-be-good/blob/master/latest/Dockerfile) runs `:PlugUpdate` before running neovim. This adds about one second
to the startup time of the game. The trade-off is that you are always playing
the latest version of the game, as long as your machine is able to access
Github.com to pull it.

```bash
docker run -it --rm brandoncc/vim-be-good:latest
```

## Playing the games.

Before doing ANYTHING at all, make sure you are in an empty file. If the file
you are in is not empty, VimBeGood will throw an error.

Ok, you are in an empty file, so first execute the following.

```viml
:VimBeGood
```

This will echo out the available set of games. Each game can take a set of
options to change how it is played, the above help menu should include each game.

## Future Games

Please make an issue if you have a command you wish to practice and i'll make
it into a game!!

## Issues

Please file an issue. But if you do, please run the logger first and paste in
the input.

To initialize the logger, add this to your vimrc

```
let g:vim_be_good_log_file = 1
```

to get the log file executed `:echo stdpath("data")` to find the path and then
copy paste it into the issues.

## Contribute

-   Fork
-   Create a feature branch
-   Make changes
-   Modify the configuration to use local build:
    `~/.config/nvim/init.vim`

```
    call plug#begin('~/.vim/plugged')
    Plug '/tmp/vim-be-good' " path to your vim-be-good fork
    call plug#end()
```

    You can also just use nvim --cmd "set rtp+=$(pwd)" . to set your current
    run time path

-   Make PR

## Live on Stream

Everything you see here has been developed on stream at [ThePrimeagen](https://twitch.tv/ThePrimeagen).
Stop by and troll away. Helpful troll hints would be to complement the size of my hands.

Big shout outs to PolarMutex, Brandon CC (stands for credit card) and TEEEEEEEEEJ
@brandoncc @bryall @tjdevries
