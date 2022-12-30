FROM docker.io/brandoncc/vim-be-good

COPY lua ~/.local/share/nvim/plugged/vim-be-good/

CMD [ "/bin/sh", "-c", "echo \"Updating vim-be-good...\" &&   nvim -u docker/init.vim --headless +'PlugUpdate --sync' +qa &&   nvim -u docker/init.vim -c 'call VimBeGood()'" ]
