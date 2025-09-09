package ai.flowrabbit.lunarmare;

import ai.flowrabbit.lunarmare.impl.*;

public interface ModelBuilder {

	public Model build();
	
	public abstract IntegerField addInteger(String name);

	public abstract DoubleField addDouble(String name);

	public abstract StringField addString(String name);

	public abstract LongField addLong(String name);

	public abstract IntField addInt(String name);


	public abstract DateField addDate(String name);

	public abstract ObjectField addObject(String name);

	public abstract ArrayField addArray(String name);

	public abstract IntArrayField addIntArray(String name);

	public abstract FloatField addFloat(String name);

	public abstract BooleanField addBoolean(String name);
}
