if has('nvim-0.5')
    fun! VimBeGood()
        " dont forget to remove this one....
        lua for k in pairs(package.loaded) do if k:match("^vim%-be%-good") then package.loaded[k] = nil end end
        lua require("vim-be-good").menu()
    endfun

    com! VimBeGood call VimBeGood()

    augroup VimBeGood
        autocmd!
        autocmd VimResized * :lua require("vim-be-good").onVimResize()
    augroup END
else
    echo 'You need nvim v0.5 or above to get better at vim'
endif
