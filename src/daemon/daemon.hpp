/*
    spihome - SmartPI-Home: a house-automation daemon for the Raspberry Pi
    Copyright (C) 2015	Simon Brennecke

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#ifndef	_include_spihome_daemon_hpp_
#define	_include_spihome_daemon_hpp_

#include <cl3/core/io_collection_list.hpp>
#include <cl3/core/io_text_string.hpp>
#include <cl3/core/system_compiler.hpp>
#include <cl3/core/system_task.hpp>
#include <cl3/core/system_task_synchronization.hpp>
#include <cl3/gpio/io_phy.hpp>

#ifdef	INSIDE_SPIHOME
	#define	SPIPUBF CL3_CXX_EXPORT_FUNC
	#define	SPIPUBT CL3_CXX_EXPORT_TYPE
	#define	SPIPUBV extern CL3_CXX_EXPORT_FUNC
#else
	#define	SPIPUBF CL3_CXX_IMPORT_FUNC
	#define	SPIPUBT CL3_CXX_IMPORT_TYPE
	#define	SPIPUBV extern CL3_CXX_IMPORT_FUNC
#endif

#define	class	class SPIPUBT
#define	struct	struct SPIPUBT

namespace	spihome
{
	using namespace cl3::io::phy;
	using namespace cl3::io::collection::list;
	using namespace cl3::io::text::string;
	using namespace cl3::system::time;
	using namespace cl3::event;

	class	IModule : public INamedObject
	{
		public:
	};

	class	IModuleInstance
	{
		public:
			SPIPUBF	static const TList<IModuleInstance*>&
								Instances	() CL3_GETTER;	//	returns a list (ordered by priority) of all module instances

			SPIPUBF	static IModule* Current	() CL3_GETTER;	//	returns the module which is currently processing on the current thread

			SPIPUBF	IModule*	Module		() const CL3_GETTER;
			SPIPUBF	size_t		Priority	() const CL3_GETTER;	//	0 = highest priority
			SPIPUBF	void		Priority	(size_t) CL3_SETTER;	//	0 = highest priority
	};

	class	IActorBase
	{
		public:
			SPIPUBF	virtual	const TString&	Name		() const CL3_GETTER = 0;
			SPIPUBF	virtual	const TString&	Description	() const CL3_GETTER = 0;
	};

	template<typename TActor>
	class	IActor : public virtual IActorBase
	{
		public:
			static const TString ACTOR_NAME;
			static const TString ACTOR_DESCRIPTION;
			
			SPIPUBF	inline	const TString&	Name		() const final override CL3_GETTER { return ACTOR_NAME; }
			SPIPUBF	inline	const TString&	Description	() const final override CL3_GETTER { return ACTOR_DESCRIPTION; }
	};

	class	IAnalogActorBase : public virtual IActorBase
	{
		public:
			SPIPUBF	virtual	float	MinValue	() const CL3_GETTER = 0;
			SPIPUBF	virtual	float	MaxValue	() const CL3_GETTER = 0;
			SPIPUBF	virtual	float	TargetValue	() const = 0;
			SPIPUBF	virtual	void	TargetValue	(float) CL3_SETTER = 0;
			SPIPUBF	virtual	float	CurrentValue() const = 0;
	};

	template<typename TActor, unsigned _N_STATES>
	class	IAnalogActor : public IAnalogActorBase, public IActor<TActor>
	{
		public:
			static const float VALUE_MAX;
			static const float VALUE_MIN;

			SPIPUBF	inline	float	MinValue	() const final override CL3_GETTER { return VALUE_MIN; }
			SPIPUBF	inline	float	MaxValue	() const final override CL3_GETTER { return VALUE_MAX; }
	};

	class	IStatefulActorBase : public virtual IActorBase
	{
		public:
			SPIPUBF	virtual	unsigned		CountStates			() const CL3_GETTER = 0;
			SPIPUBF	virtual	const TString&	StateName			(unsigned index) const CL3_GETTER = 0;
			SPIPUBF	virtual	const TString&	StateDescription	(unsigned index) const CL3_GETTER = 0;

			SPIPUBF	virtual	unsigned		State				() const CL3_GETTER = 0;
			SPIPUBF	virtual	void			State				(unsigned) CL3_SETTER = 0;
	};

	template<typename TActor, unsigned _N_STATES>
	class	IStatefulActor : public IStatefulActorBase, public IActor<TActor>
	{
		public:
			static const unsigned N_STATES = _N_STATES;
			static const TString STATE_NAMES[N_STATES];
			static const TString STATE_DESCRIPTIONS[N_STATES];

			SPIPUBF	inline	unsigned		CountStates			() const CL3_GETTER { return N_STATES; }
			SPIPUBF	inline	const TString&	StateName			(unsigned index) const final override CL3_GETTER { return STATE_NAMES[index]; }
			SPIPUBF	inline	const TString&	StateDescription	(unsigned index) const final override CL3_GETTER { return STATE_DESCRIPTIONS[index]; }
	};

	class	IValueSetter
	{
		private:
			IValueSetter(IValueSetter&) = delete;
			IValueSetter& operator=(IValueSetter&) = delete;

		protected:
			IModuleInstance* module;

		public:
			SPIPUBF	virtual	~IValueSetter	();

			SPIPUBF	virtual	const IActorBase*	Actor	() const CL3_GETTER = 0;
			SPIPUBF	IModuleInstance*			Module	() const CL3_GETTER;
	};

	class	TAnalogValueSetter : public IValueSetter
	{
		protected:
			const IAnalogActorBase* actor;
			float target_value;

		public:
			SPIPUBF	CLASS	TAnalogValueSetter	(const IAnalogActorBase* actor, float target_value);
			
			SPIPUBF	const IAnalogActorBase*	Actor	() const final override CL3_GETTER;
			SPIPUBF	float					Value	() const CL3_GETTER;
	};
	
	class	TStateSetter : public IValueSetter
	{
		protected:
			const IStatefulActorBase* actor;
			unsigned target_state;
			
		public:
			SPIPUF	CLASS	TStateSetter	(const IStatefulActorBase* actor, unsigned target_state);
			
			SPIPUBF	const IStatefulActorBase*	Actor	() const final override CL3_GETTER;
			SPIPUBF	unsigned					Value	() const CL3_GETTER;
	};













	class	TTimedWindowDrive : public IStatefulActor<TTimedWindowDrive, 2>
	{
		public:
			SPIPUBF	unsigned	State	() const final override CL3_GETTER;
			SPIPUBF	void		State	(unsigned) final override CL3_SETTER;

			SPIPUBF	CLASS	TTimedWindowDrive	(cl3::io::phy::gpio::IPin* pin1, cl3::io::phy::gpio::IPin* pin2, TTime time_open, TTime time_close);
			SPIPUBF	virtual	~TTimedWindowDrive	();
	};

	template<> const TString IActor<TTimedWindowDrive>::ACTOR_NAME = { "Timed Window Drive" };
	template<> const TString IActor<TTimedWindowDrive>::ACTOR_DESCRIPTION = { "controls window drives that have no auto-stop function by timing them" };
	template<> const TString IStatefulActor<TTimedWindowDrive, 2>::STATE_NAMES[2] = { "closed", "open" };
	template<> const TString IStatefulActor<TTimedWindowDrive, 2>::STATE_DESCRIPTIONS[2] = { "This state indicates that the winow is closed", "This state indicates that the window is open" };
}

#undef	class
#undef	struct

#endif
