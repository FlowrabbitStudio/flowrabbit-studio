package ai.flowrabbit.lunarmare.impl;

public class IntField extends Field {

    public IntField(ModelImpl parent, String name) {
        super(parent, name);
    }

    public Type getType(){
        return Type.Double;
    }

    public IntField setOptional(){
        isRequired = false;
        return this;
    }

    public IntField setHidden(){
        hidden = true;
        return this;
    }
}
