# vim-be-good
Vim be good is a plugin designed to make you better at vim by creating a game
to practice basic movements in.

## Warning no instructions on games currently
Working on that next or one of these days.

To play `relative` you need to delete the line that
says `DELETE ME`.  Use relative jumps

To play `ci{` you need to replace the contents
inside the _first_ { or [ with bar.  HINT, use ci[
or ci{ and type bar.

To play `whackamole` you need to navigate to the character with the caret under
it as fast as possible. Once you have reached the character, flip the
character's case to complete the round.

## Installation
Use your favorite plugin manager to install!  Only works on Nvim, the one true
vim.

```viml
Plug 'ThePrimeagen/vim-be-good'
```

Then execute `:UpdateRemotePlugins` to finish the installation process.

## Playing the games.
Before doing ANYTHING at all, make sure you are in an empty file.  If the file
you are in is not empty, VimBeGood will throw an error.

Ok, you are in an empty file, so first execute the following.

```viml
:VimBeGood
```

This will echo out the available set of games.  Each game can take a set of
options to change how it is played, the above help menu should include each game.

## Future Games
Please make an issue if you have a command you wish to practice and i'll make
it into game!!

