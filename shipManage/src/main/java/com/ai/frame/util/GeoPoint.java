package com.ai.frame.util;

/**
 * 地理坐标点
 * @author daidd
 *
 */
public class GeoPoint {
	
	private double x;
	
	private double y;
	
	public GeoPoint(double xVal, double yVal){
		this.x = xVal;
		this.y = yVal;
	}

	public double getX() {
		return x;
	}

	public void setX(double x) {
		this.x = x;
	}

	public double getY() {
		return y;
	}

	public void setY(double y) {
		this.y = y;
	}


}
