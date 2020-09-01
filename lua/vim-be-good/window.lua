local log = require("vim-be-good.log")
local Buffer = require("vim-be-good.buffer")
local WindowHandler = {}

local function generateConfig(padding)
    padding = padding or 6
    local vimStats = vim.api.nvim_list_uis()[1]
    local w = vimStats.width
    local h = vimStats.height

    local halfPadding = math.floor(padding / 2)
    local width = w - padding
    local row = halfPadding
    local col = w - width

    return {
        row = halfPadding,
        col = halfPadding,
        width = w - padding,
        height = h - padding,
        relative = "editor",
    }
end

function WindowHandler:new(padding)

    local newWindow = {
        config = generateConfig(padding),
        padding = padding,
        bufh = 0,
        buffer = nil,
        winId = 0,
    }

    self.__index = self
    return setmetatable(newWindow, self)
end

function WindowHandler:close()
    if self.winId ~= 0 then
        vim.fn.nvim_win_close(self.winId, true)
    end

    self.winId = 0

    log.info("window#close", debug.traceback())
    if self.buffer then
        self.buffer:close()
    end

    self.bufh = 0
    self.buffer = nil
end

function WindowHandler:show()
    if self.bufh == 0 then
        self.bufh = vim.fn.nvim_create_buf(false, true)
        self.buffer = Buffer:new(self.bufh, self)
    end

    if self.winId == 0 then
        self.winId = vim.api.nvim_open_win(self.bufh, true, self.config)
    else
        vim.api.nvim_win_set_config(self.winId, self.config)
    end
end

function WindowHandler:onResize()
    print("onResize before", vim.inspect(self.config))
    self.config = generateConfig(self.padding)
    print("onResize", vim.inspect(self.config))
    self:show()
end

return WindowHandler

