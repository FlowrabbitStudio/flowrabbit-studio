package ai.flowrabbit.backup;

import java.io.File;
import java.io.Serializable;

public class RestoreResult implements Serializable {

	public static final String TYPE_APP= "App";

	public static final String TYPE_USER= "User";

	private static final long serialVersionUID = 9156441279042448052L;

	private final String file;

	private final String type;

	public RestoreResult(String file, boolean isUser) {
		this.file = file;
		if (isUser) {
			this.type = TYPE_USER;
		} else {
			this.type = TYPE_APP;
		}
	}

	private long ignored = 0;
	
	private long restored = 0;

	private long errors = 0;

	public void incError() {
		this.errors++;
	}

	public void incRestored() {
		this.restored++;
	}

	public void incIgnored() {
		this.ignored++;
	}

	public void setIgnored(long ignored) {
		this.ignored = ignored;
	}

	public long getRestored() {
		return restored;
	}

	public void setRestored(long restored) {
		this.restored = restored;
	}

	public long getErrors() {
		return errors;
	}

	public void setErrors(long errors) {
		this.errors = errors;
	}

	public long getIgnored() {
		return ignored;
	}


	public String getFile() {
		return file;
	}

	public String getType() {
		return type;
	}
}