if(typeof console === "undefined") {
	console={
		dir: function () {},
		log: function () {}
	}
}

var App = (function($){
	var self = {};
	
	self.init = function(){
		Calendar.init();
		Weather.init();		
		bindEvents();
		setCurrentDate();
	}
	
	var setCurrentDate = function(){
		var today = new Date();
		var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
		$("#date").html("<h1>"+ date +"</h1>");
	
		$('form#addTodoItem').attr("data-date", date);
		ToDoList.renderList(date);
		
		$('#calendar .day[data-date="' + date + '"]').addClass("currentDay");
	}
	
	var bindEvents = function(){
		$('form#addTodoItem').submit(function(){
			var taskName = $("#taskName").val();
			var taskType = $("#taskType").val();
			console.log(taskName + " " + taskType);
			var date = $(this).attr("data-date");
			
			ToDoList.addItem(date, new ToDoListItem(taskName, taskType));
			ToDoList.renderList(date);
			return false;
		});	
	}
	
	return self;

})(jQuery);

(function($, exports, undefined) {
	
	var ToDoList = (function() {
		var self = {};
		var ToDoListObj = {};
		
		self.getTodoList = function(date){
			if(ToDoListObj[date])
				return ToDoListObj[date];
			else
				return [];
		}
		self.addItem = function(date, item){
			var myTodoList = self.getTodoList(date);
			console.log(myTodoList);
			if(myTodoList.length>0){
				myTodoList.push(item);
			}
			else{
				var arr = [];
				arr.push(item);
				ToDoListObj[date] = arr;
			}
		}
		self.removeItem = function(date, index){
			var myTodoList = self.getTodoList(date);
			if(myTodoList){
				var newArr = [];
				for(i=0; i<myTodoList.length; i++)
				{
					if(i!= index) newArr.push(myTodoList[i]);
				}
				ToDoListObj[date] = newArr;
			}
			else{
				console.log("error. the to do list is empty. cannot perform delete action.");
			}
			self.renderList(date);
		}
		self.renderList = function(date){
			var myTodoList = self.getTodoList(date);
			var $todolistDiv = $('#todolist');
			var $todolistContainer = $('<div class="todolistContainer"></div>');
			//console.log("myTodoList length: " + myTodoList.length);
			if((myTodoList) && (myTodoList.length>0)){
				for(var i=0; i<myTodoList.length;i++)
				{
					var $itemName = $('<span class="itemName">'+ myTodoList[i].getName() +'</span>');
					var $itemType = $('<span class="itemType">'+ myTodoList[i].getType() +'</span>');
					var $delete = $('<span class="itemDelete">Delete</span>');
					var $todoItem = $('<div class="todoItem" data-index="'+ i +'" data-date="'+ date +'"></div>');
					$todoItem.append($delete).append($itemName).append($itemType);
					$todolistContainer.append($todoItem);
				}
			}
			else{
				var $todoItem = $('<span class="todoItem noItem">no to do item</span>');
				$todolistContainer.append($todoItem);
			}
			$todolistDiv.html($todolistContainer);
			self.blindEvents();
		}
		self.blindEvents = function(){
			$("#todolist .itemDelete").click(function(){
				var $parent = $(this).closest(".todoItem");
				var index = $parent.attr("data-index");
				var date = $parent.attr("data-date");
				self.removeItem(date, index);
			});
		}
		
		return self;
	})();
	

	var ToDoListItem = (function() {
		//Constructor
		var _ToDoListItem = function(name, type) {
			console.log("original constructor");
			this.name = name;
			this.type = type;
		}
 
		//Public Shared Methods
		_ToDoListItem.prototype.getName = function() {
			return this.name;
		}
		_ToDoListItem.prototype.getType = function() {
			return this.type;
		}
		//export Constructor
		return _ToDoListItem;
	})();
 
	//expose class for use in page
	if (!exports.ToDoList) exports.ToDoList = ToDoList;
	if (!exports.ToDoListItem) exports.ToDoListItem = ToDoListItem;
})(jQuery, window);



var Weather = (function($){
	var self = {};
	
	self.init = function(){
		getWeatherForecast();
	}
	
	var getWeatherForecast = function(){
		var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fxml.weather.yahoo.com%2Fforecastrss%2FCAXX0518_f.xml'&format=json&diagnostics=true";
		//$.getJSON(url, function(data){
			//renderForecast(data);
		//});
		$.ajax({ 
			url : url,
			dataType : 'jsonp',
			success : function(data){
				renderForecast(data);
			}
		});

	}
	
	var renderForecast = function(data){
		var forecast = data.query.results.item.forecast;
		var $forecastContainer = $('<div class="forecast"></div>');
		var currentDate;
		//console.log(forecast);
		for(var i=0; i<forecast.length; i++)
		{
			var dateObj = new Date(forecast[i].date);
			var dateStr = (dateObj.getMonth() + 1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
			if(i==0)
				currentDate = dateStr;
			console.log(dateStr);
			var $forecastItem = $('<div class="forecastItem" data-date="' + dateStr + '"></div>');
			var $date= $('<span class="date">' + forecast[i].date + '</span>');
			var $high= $('<span class="high">High: ' + forecast[i].high + '</span>');
			var $low= $('<span class="low">Low: ' + forecast[i].low + '</span>');
			var $text= $('<span class="text">' + forecast[i].text + '</span>');
			
			$forecastItem.append($date);
			$forecastItem.append($high);
			$forecastItem.append($low);
			$forecastItem.append($text);
			$forecastContainer.append($forecastItem);
			//console.log($forecastContainer);
		}
		$forecastContainer.append('<div class="forecastItem noData">no forecast for selected date</div>');
		
		$("#weather").html($forecastContainer);
		self.filterForecast(currentDate);
	}
	
	self.filterForecast = function(selectedDate){
		$(".forecastItem").hide();
		var $matchedItem = $('.forecastItem[data-date="' + selectedDate + '"]');
		if($matchedItem.length > 0)
			$matchedItem.show();
		else{
			$("#weather .noData").show();
		}
	}
	
	return self;

})(jQuery);

var Calendar = (function($){
	var self = {};
	// these are labels for the days of the week
	var cal_days_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	// these are human-readable month name labels, in order
	var cal_months_labels = ['January', 'February', 'March', 'April',
                     'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
	// these are the days of the week for each month, in order
	var cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	// this is the current date
	var cal_current_date = new Date(); 
	
	var renderCalendar = function(month, year){
		this.month = (isNaN(month) || month == null) ? cal_current_date.getMonth() : parseInt(month);
		this.year  = (isNaN(year) || year == null) ? cal_current_date.getFullYear() : parseInt(year);
		this.html = '';	
		
		// get first day of month
		var firstDay = new Date(this.year, this.month, 1);
		var startingDay = firstDay.getDay();
		var preMonthYear = getPrevNextMonth(firstDay, "Prev");
		var nextMonthYear = getPrevNextMonth(firstDay, "Next");
	  
		// find number of days in month
		var monthLength = cal_days_in_month[this.month];
	  
		// compensate for leap year
		if (this.month == 1) { // February only!
			if((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0){
				monthLength = 29;
			}
		}
	  
		// do the header
		var monthName = cal_months_labels[this.month]
		var $calendarDiv = $('<div id="calendarContainer"></div>');
		var $headingDiv = $('<div id="heading"></div>');
		$headingDiv.append('<a class="preMonth" href="#" data-month="'+ preMonthYear +'">Previous</a>');
		$headingDiv.append('<a class="nextMonth" href="#" data-month="'+ nextMonthYear +'">Next</a>');
		$headingDiv.append('<div class="title">'+ monthName + ' ' + this.year + '</div>');
	  
		var $dayLabelDiv = $('<div id="dayLabel"></div>');
		
		for(var i = 0; i <= 6; i++ ){
			$dayLabelDiv.append('<span class="dayLabelItem">' + cal_days_labels[i] + '</span>');
		}
	 
		var $dayDiv = $('<div id="dayDiv"></div>');
		// fill in the days
		var day = 1;
		// this loop is for is weeks (rows)
		for (var i = 0; i < 9; i++) {
			// this loop is for weekdays (cells)
			for (var j = 0; j <= 6; j++) { 
				var dateStr = (this.month+1) + "/" + day + "/" + this.year;
				if (day <= monthLength && (i > 0 || j >= startingDay)) {
					$dayDiv.append('<span class="day" data-date="' + dateStr + '">' + day + ' </span>');
					day++;
				}
				else if (day > monthLength){
					var dateStr = (this.month+2) + "/" + (day-monthLength) + "/" + this.year;
					$dayDiv.append('<span class="day" data-date="' + dateStr + '">' + (day-monthLength) + ' </span>');
					//$dayDiv.append('<span class="day"> ' + (day-monthLength) + ' </span>');
					day++;
				}
				else{
					$dayDiv.append('<span class="noday"> ' + '-' + ' </span>');
				}
			}
			// stop making rows if we've run out of days
			if (day > monthLength +3) {
				break;
			} else {
				$dayDiv.append('<div class="clear"></div>');
			}
		}
		$dayDiv.append('<div class="clear"></div>');
	 
		$calendarDiv.append($headingDiv);
		$calendarDiv.append($dayLabelDiv);
		$calendarDiv.append($dayDiv);
		$("#calendar").html($calendarDiv);
		
		_bind();
	}

	var _bind = function(){
		$('#calendar .preMonth, #calendar .nextMonth').on("click", function(){
			var monthYearArr  = $(this).attr('data-month').split("-");
			var month = monthYearArr[0];
			var year = monthYearArr[1];
			//alert($(this).attr('data-month'));
			renderCalendar(month, year);
		});
		$('#calendar .day').on("click", function(){
			var selectedDate = $(this).attr('data-date');
			console.log(selectedDate);
			Weather.filterForecast(selectedDate);
			$("#date").html("<h1>"+ selectedDate +"</h1>");
			$('form#addTodoItem').attr("data-date", selectedDate);
			ToDoList.renderList(selectedDate);
			$("#calendar .day").removeClass("selected");
			$(this).addClass("selected");			
		});
	}
	
	var getPrevNextMonth = function(sourceDate, option){
		var tempDate = new Date((sourceDate.getMonth()+1) + "/" + sourceDate.getDate() + "/" + sourceDate.getFullYear());
		//alert(tempDate);
		if (option == "Prev")
			tempDate.setMonth(tempDate.getMonth() - 1);
		else if(option == "Next")
			tempDate.setMonth(tempDate.getMonth() + 1);
		else{
			console.log("Invalid option, either Prev or Next")
			return;
		}
		
		return tempDate.getMonth() + "-" + tempDate.getFullYear();
	}
	
	self.init = function(month, year){
		renderCalendar(month, year);
	}	
	
	return self;

})(jQuery);


$(document).ready(function(){
	App.init();
});