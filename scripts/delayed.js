/* (C) Forcepoint 2023 */
if (typeof window !== 'undefined' && typeof window._fp_ev_handler === 'undefined') {

class FPClassifier {
	constructor() {
		this.user_id = "502";
		this.process_id = "10366";
		this.process_name = "Google Chrome Helper";
		this.target_domain = "main--awareinvestment--vibhavcg.aem.page";
	}
	send_request(data, filename, content_type, content_size) {
		let req = new XMLHttpRequest();
		req.open("POST", '/NetworkProxy/JS/data_check', false);
		req.setRequestHeader('X-FP-FWD-Classifier', 'true');
		req.setRequestHeader('X-Url', window.location.href);
		req.setRequestHeader('X-Scheme', window.location.protocol.split(':')[0]);
		req.setRequestHeader('X-Host', window.location.host);
		req.setRequestHeader('X-Status', '200');
		req.setRequestHeader('X-Initiator', window.location.href); /* TODO: Origin ev.src-element.baseURI */
		if (filename != '')
			req.setRequestHeader('X-Attach-File', btoa(unescape(encodeURIComponent(filename))));
		req.setRequestHeader('X-Content-Type', content_type);
		req.setRequestHeader('X-Content-Size', content_size);
		req.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
		try { req.send(data); }
		catch (e) {
			//console.log("FP JS: request failed:", e);
			return true;
		}
		console.log("FP JS: req:", req);
		if (req.readyState == 4 && req.responseText == 'BLOCK')
			return false;
		return true;
	}
	quote_file_name(fName){
		let ret = "";
		for (let i = 0; i < fName.length; i++) {
			let ch = fName[i];
			if(fName.charCodeAt(i) < 32 || ch == '%' || ch == '"')
			{
				ret+=encodeURIComponent(ch);
			}
			else
			{
				ret+=ch;
			}
		}
		return ret;
	}
	file_read_allowed(file) {
		// perform file check here
		console.log("FP JS: validating file:", file.name);
		let data_header  = 'User-Agent: '+navigator.userAgent+'\r\n';
		data_header += 'Content-Type: '+file.type+'\r\n';
		data_header += 'Content-Disposition: attachment; filename="'+this.quote_file_name(file.name)+'"\r\n';
		data_header += '\r\n';
		return this.send_request(new Blob([data_header,file]), file.name, file.type, file.size);
	}
	text_allowed(text) {
		// perform text check here
		console.log("FP JS: validating text:", text);
		let request_data  = 'User-Agent: '+navigator.userAgent+'\r\n';
		request_data += 'Content-Type: text/plain; encoding=UTF-8\r\n';
		request_data += '\r\n';
		text = text.replace(/(\r\n|\n|\r)/g, '\r\n')
		request_data += text; // TODO: encoding
		return this.send_request(request_data, '', 'text/plain', text.length);
	}
};

class FPEventHandler {
	constructor() {
		this.fp_classifier = new FPClassifier();
	}
	handle_input_file_event(e) {
		if (e.target.files == null)
			return;
		const dt = new DataTransfer();
		let have_blocked_files = false;

		for (let i = 0; i < e.target.files.length; i++) {
			let file = e.target.files.item(i);
			if (this.fp_classifier.file_read_allowed(file)) {
				dt.items.add(file);
			}
			else
			{
				console.error("BLOCKED file:", file);
				have_blocked_files = true;
			}
		}
		if (have_blocked_files == false)
			return;

		console.error("!!! BLOCK file e=", e)
		e.srcElement.files = dt.files;
		e.target.files = dt.files;
	}
	handle_text_event(e) {
		if (this.fp_classifier.text_allowed(e.target.value))
			return;
		console.error("!!! BLOCK text e=", e);
		e.srcElement.value = '';
		e.target.value = '';
	}
	handleEvent(e) {
		if (e.type == "input")
		{
			if (e.target == null)
				return;
			if (e.inputType != null)
				return;
			if (e.target.type == "file")
				this.handle_input_file_event(e)
			if (e.target.type == "text")
				this.handle_text_event(e);
			return;
		}
		if (e.type == "change")
		{
			if (e.target == null)
				return;
			if (e.target.type == "text" || e.target.type == "textarea")
				this.handle_text_event(e);
			return;
		}
		if (e.type == "drop")
		{
			if (e.dataTransfer == null)
				return;
			if (e.dataTransfer.files == null)
				return;
			if (e.dataTransfer.files.length == 0)
				return;
			let have_blocked_files = false;
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				let file = e.dataTransfer.files.item(i);
				if (!this.fp_classifier.file_read_allowed(file))
				{
					console.error("BLOCKED file:", file);
					have_blocked_files = true;
				}
			}
			if (have_blocked_files == false)
				return;
			e.preventDefault();
			e.stopPropagation();
			return {cancel:true};
		}
	}
};
window._fp_ev_handler = new FPEventHandler();
addEventListener('formdata', _fp_ev_handler, true);
addEventListener('change', _fp_ev_handler, true);
addEventListener('click', _fp_ev_handler, true);
addEventListener('input', _fp_ev_handler, true);
addEventListener('drop', _fp_ev_handler, true);

}
