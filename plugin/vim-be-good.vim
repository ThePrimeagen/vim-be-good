fun! VimBeGood()
    lua package.loaded["vim-be-good"] = nil
    lua package.loaded["vim-be-good.window"] = nil
    lua package.loaded["vim-be-good.menu"] = nil
    lua package.loaded["vim-be-good.buffer"] = nil
    lua require("vim-be-good").menu()
endfun

augroup VimBeGood
    autocmd!
augroup END


