local bind = require("vim-be-good.bind")

local function createEmpty(count)
    local lines = {}
    for idx = 1, count, 1 do
        lines[idx] = ""
    end

    return lines
end

local Buffer = {}
function Buffer:new(bufh, window)
    local onChangeList = {}
    local newBuf = {
        bufh = bufh,
        window = window,
        instructions = {},
        onChangeList = onChangeList,
        lastRendered = {},
    }

    self.__index = self
    local createdObject = setmetatable(newBuf, self)

    createdObject:attach()
    return createdObject
end

function Buffer:close()
    assert(false, "how did I get here?")
    vim.api.nvim_buf_detach(self.bufh)
end

function Buffer:_scheduledOnLine()
    if self == nil or self.onChangeList == nil then
        print("Memory Leak...", self.bufh, self.window)
        return
    end

    for _, fn in ipairs(self.onChangeList) do

        local status, ret, err = xpcall(fn, debug.traceback, buf, changedtick, firstline, lastline, linedata, more)

        if status == false then
            print("Error in buf_attach, must close down:", err)
            xpcall(bind(self.window, "close"), debug.traceback)
        end
    end
end

function Buffer:onLine(buf, changedtick, firstline, lastline, linedata, more)
    vim.schedule(bind(self, "_scheduledOnLine"))
end

function Buffer:attach()
    vim.api.nvim_buf_attach(self.bufh, true, {
        on_lines = bind(self, "onLine")
    })
end


function Buffer:render(lines)

    local idx = 1
    local instructionLen = #self.instructions
    local lastRenderedLen = #self.lastRendered

    self:clear()
    self.lastRendered = lines

    if self.debugLineStr ~= nil then
        vim.api.nvim_buf_set_lines(
            self.bufh, 0, 1, false, {self.debugLineStr})
    end

    if instructionLen > 0 then
        vim.api.nvim_buf_set_lines(
            self.bufh, idx, idx + instructionLen, false, self.instructions)
        idx = idx + instructionLen
    end

    vim.api.nvim_buf_set_lines(self.bufh, idx, idx + #lines, false, lines)
end

function Buffer:debugLine(line)
    if line ~= nil then
        self.debugLineStr = line
    end
end

function Buffer:setInstructions(lines)
    self.instructions = lines
end

function Buffer:clearGameLines()
    local startOffset = table.getn(self.instructions) + 1
    local len = table.getn(self.lastRendered)

    vim.api.nvim_buf_set_lines(
        self.bufh, startOffset, startOffset + len, false, createEmpty(len))
end

function Buffer:getGameLines()
    local startOffset = table.getn(self.instructions) + 1
    local len = table.getn(self.lastRendered)

    local lines = vim.api.nvim_buf_get_lines(
        self.bufh, startOffset, startOffset + len, false)

    return lines
end

function Buffer:clear()
    local len = #self.instructions + 1 + (#self.lastRendered or 0)

    vim.api.nvim_buf_set_lines(
        self.bufh, 0, len, false, createEmpty(len))
end

function Buffer:onChange(cb)
    table.insert(self.onChangeList, cb)
end

function Buffer:removeListener(cb)

    local idx = 1
    local found = false
    while idx <= #self.onChangeList and found == false do
        found = self.onChangeList[idx] == cb
        if found == false then
            idx = idx + 1
        end
    end

    if found then
        table.remove(self.onChangeList, idx)
    end
end

return Buffer

