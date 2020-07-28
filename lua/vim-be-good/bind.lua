local function bind(t, k)
    return function(...) return t[k](t, ...) end
end

return bind


