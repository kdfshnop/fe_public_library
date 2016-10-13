define(function(){
	/**
	     * @description 在控制台输出调试信息（在浏览器不支持的情况下默认不会输出）
	     *              例：
	     *              log('需要输出的消息','error');
	     *              log('[一个不可预知的错误]','需要输出的错误消息','info');
	     *
	     * @param   name{String} 错误消息或者需要展现的标示信息
	     * @param   msg{String}(可选) 错误消息，或者消息类型(error,info,warn,log);默认已log类型输出
	     * @param   type{String}(可选) 消息类型
	     * @return  Object
	     * */
	var log = function(name,msg){
        //debug
        if(location.search.match(/debug=true/) ){
            try{
                var b=msg!='' && msg!='info' && msg!='warn'&&msg!='log',
                    errorType = arguments[2] || 'log';
                w.console && (
                        arguments.length - 1 == 0 && (
                            msg = name,name = new Date().toLocaleString()),
                            arguments.length-1 == 1 && (
                                b && (name = name,msg=msg) || (!b && (
                                    errorType = msg,msg = name,name = new Date().toLocaleString()
                                ))
                            ),
                            w.console[errorType]('[ '+name+' ] '+ msg)
                );
            }catch(ex){

            }
        }
    };
    return log;
});